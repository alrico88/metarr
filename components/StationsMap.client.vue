<template lang="pug">
.stations-map.position-relative.border.rounded.overflow-hidden
  mgl-map(
    :map-style="mapStyle",
    :center="INITIAL_CENTER",
    :zoom="INITIAL_ZOOM",
    :min-zoom="2",
    @map:load="onLoad",
    @map:movestart="onMoveStart",
    @map:moveend="debouncedLoad"
  )
    mgl-navigation-control(position="top-left")
    //- Declared before the stations so the satellite layer sits under the dots.
    mgl-raster-source(
      source-id="clouds",
      :tiles="CLOUDS_TILES",
      :tile-size="256",
      attribution="Clouds © EUMETSAT"
    )
      mgl-raster-layer(
        layer-id="clouds",
        :layout="cloudsLayout",
        :paint="{ 'raster-opacity': 0.6 }"
      )
    mgl-geo-json-source(source-id="stations", :data="geoJson")
      mgl-circle-layer(
        layer-id="stations-circles",
        :paint="CIRCLE_PAINT",
        @mousemove="onHover",
        @mouseleave="onLeave",
        @click="onClick"
      )
    mgl-popup(
      v-if="hovered",
      :coordinates="[hovered.longitude, hovered.latitude]",
      :offset="14",
      :close-button="false",
      :close-on-click="false",
      :focus-after-open="false",
      :max-width="'340px'",
      class-name="station-tooltip"
    )
      div(role="tooltip")
        .hstack.gap-2.mb-1
          strong {{ hovered.icao }}
          flight-category-badge(:category="hovered.flight_category")
        .font-monospace.small.mb-2 {{ hovered.metar }}
        b-table-simple.mb-0(v-if="decodedRows.length", small, borderless)
          b-tbody
            b-tr(v-for="row of decodedRows", :key="row.label")
              b-th.fw-normal.text-muted {{ row.label }}
              b-td {{ row.value }}
        .small.text-muted(v-else-if="decoded === 'error'") Couldn't decode this METAR
        .hstack.gap-2.small.text-muted(v-else)
          b-spinner(small)
          | Decoding...
  .position-absolute.top-0.start-0.mt-2.filters(style="margin-left: 3.2rem")
    b-form-checkbox-group(v-model="conditions", :options="CONDITIONS", buttons, button-variant="outline-secondary", size="sm", class="bg-body flex-wrap")
  .position-absolute.bottom-0.end-0.m-2.mb-4
    b-form-checkbox.bg-body.rounded.px-5.py-1.small(v-model="showClouds", switch) Clouds (IR)
  .position-absolute.top-0.end-0.m-2
    b-badge(v-if="zoomedOut", variant="secondary") Zoom in to see stations
    b-badge(v-else-if="loading", variant="secondary")
      b-spinner.me-1(small)
      | Loading stations
    b-badge(v-else-if="failed", variant="danger") Couldn't load stations
    b-badge(v-else, variant="light", border-variant="secondary") {{ visibleStations.length }} / {{ stations.length }} stations
  b-card.position-absolute.bottom-0.start-0.m-2.small(no-body)
    b-form-checkbox-group.vstack.gap-1.p-2(v-model="categories", stacked)
      b-form-checkbox(v-for="c of CATEGORIES", :key="c", :value="c")
        span.dot.me-1(:style="{ backgroundColor: flightCategoryColor(c) }")
        | {{ c }}
</template>

<script setup lang="ts">
import {
  MglCircleLayer,
  MglGeoJsonSource,
  MglMap,
  MglNavigationControl,
  MglPopup,
  MglRasterLayer,
  MglRasterSource,
} from "@indoorequal/vue-maplibre-gl";
import type {
  CircleLayerSpecification,
  Map as MaplibreMap,
  MapLayerMouseEvent,
} from "maplibre-gl";

// EUMETSAT multi-satellite IR 10.8 µm mosaic: global between ~70ºN/S, updated every 3 h, no API key.
const CLOUDS_TILES = [
  "https://view.eumetsat.int/geoserver/ows?service=WMS&version=1.3.0&request=GetMap&layers=mumi:worldcloudmap_ir108&styles=&format=image/png&transparent=true&crs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}",
];
const FETCH_DEBOUNCE_MS = 300;
const MIN_ZOOM_TO_FETCH = 3;
const FETCH_PADDING = 0.5;
// Stable references: a new array literal in the template would reset the camera on every re-render.
const INITIAL_CENTER: [number, number] = [0, 30];
const INITIAL_ZOOM = 3;

const emit = defineEmits<{ select: [icao: string] }>();

const mapStyle = useMapStyle();

const CIRCLE_PAINT = {
  "circle-color": [
    "match",
    ["get", "flight_category"],
    ...["VFR", "MVFR", "IFR", "LIFR"].flatMap((c) => [c, flightCategoryColor(c)]),
    flightCategoryColor(),
  ],
  "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 4, 8, 7, 12, 10],
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 1.5,
} as CircleLayerSpecification["paint"];

let map: MaplibreMap | undefined;
let controller: AbortController | undefined;
let decodeController: AbortController | undefined;
let fetchedBox: { west: number; south: number; east: number; north: number } | undefined;

const CONDITIONS = [
  { value: "wind", text: "Wind ≥ 20 kt", test: (s: MapStation) => (s.wind_kt ?? 0) >= 20 },
  { value: "visibility", text: "Visibility < 3 SM", test: (s: MapStation) => (s.visibility_mi ?? Infinity) < 3 },
  { value: "precip", text: "Precipitation", test: (s: MapStation) => /RA|SN|DZ|GR|GS|PL|SG|IC|UP/.test(s.wx ?? "") },
  { value: "thunder", text: "Thunderstorm", test: (s: MapStation) => /TS/.test(s.wx ?? "") },
];
const CATEGORIES = ["VFR", "MVFR", "IFR", "LIFR"];

const showClouds = useLocalStorage("metarr:map-clouds", false);

const categories = ref([...CATEGORIES]);
const conditions = ref<string[]>([]);

const stations = shallowRef<MapStation[]>([]);
const visibleStations = computed(() => {
  const tests = CONDITIONS.filter((c) => conditions.value.includes(c.value));
  return stations.value.filter(
    (s) =>
      (!CATEGORIES.includes(s.flight_category) || categories.value.includes(s.flight_category)) &&
      tests.every((c) => c.test(s))
  );
});
const loading = ref(false);
const failed = ref(false);
const zoomedOut = ref(false);
const hovered = shallowRef<MapStation | null>(null);

const decodedCache = reactive(new Map<string, IMetar | "error">());
const decoded = computed(() =>
  hovered.value ? decodedCache.get(hovered.value.icao) : undefined
);

const geoJson = computed(() => ({
  type: "FeatureCollection" as const,
  features: visibleStations.value.map((s) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [s.longitude, s.latitude] },
    properties: { icao: s.icao, flight_category: s.flight_category },
  })),
}));

const cloudsLayout = computed(() => ({
  visibility: showClouds.value ? ("visible" as const) : ("none" as const),
}));

async function loadStations() {
  if (!map) {
    return;
  }

  controller?.abort();
  zoomedOut.value = map.getZoom() < MIN_ZOOM_TO_FETCH;

  if (zoomedOut.value) {
    loading.value = false;

    return;
  }

  const b = map.getBounds();
  const view = {
    west: b.getWest(),
    south: b.getSouth(),
    east: b.getEast(),
    north: b.getNorth(),
  };

  // The loaded box is still enough while the view stays inside it.
  if (
    fetchedBox &&
    view.west >= fetchedBox.west &&
    view.east <= fetchedBox.east &&
    view.south >= fetchedBox.south &&
    view.north <= fetchedBox.north
  ) {
    loading.value = false;

    return;
  }

  const padX = (view.east - view.west) * FETCH_PADDING;
  const padY = (view.north - view.south) * FETCH_PADDING;
  const box = {
    west: Math.max(-180, view.west - padX),
    south: Math.max(-90, view.south - padY),
    east: Math.min(180, view.east + padX),
    north: Math.min(90, view.north + padY),
  };
  const current = (controller = new AbortController());
  loading.value = true;
  failed.value = false;

  try {
    stations.value = await $fetch<MapStation[]>("/api/stations/bounds", {
      query: box,
      signal: current.signal,
    });
    fetchedBox = box;
    loading.value = false;
  } catch {
    // ofetch wraps aborts in a FetchError, so check the signal instead of the error name.
    if (current.signal.aborted) {
      return;
    }

    failed.value = true;
    loading.value = false;
  }
}

const debouncedLoad = useDebounceFn(loadStations, FETCH_DEBOUNCE_MS);

// Drop an in-flight request as soon as the camera moves again.
function onMoveStart() {
  controller?.abort();
}

function onLoad(e: { map: MaplibreMap }) {
  map = e.map;
  loadStations();
}

// Layer events are MapLibre's own events, so `target` is the map.
function onHover(e: MapLayerMouseEvent) {
  const icao = e.features?.[0]?.properties?.icao;
  const station = stations.value.find((s) => s.icao === icao) ?? null;

  if (station?.icao === hovered.value?.icao) {
    return;
  }

  e.target.getCanvas().style.cursor = "pointer";
  hovered.value = station;
  decodeController?.abort();

  if (station) {
    fetchDecoded(station.icao);
  }
}

function onLeave(e: MapLayerMouseEvent) {
  e.target.getCanvas().style.cursor = "";
  hovered.value = null;
  decodeController?.abort();
}

function onClick(e: MapLayerMouseEvent) {
  const icao = e.features?.[0]?.properties?.icao;
  if (icao) {
    emit("select", icao);
  }
}

async function fetchDecoded(icao: string) {
  if (decodedCache.has(icao)) {
    return;
  }

  const current = (decodeController = new AbortController());

  try {
    decodedCache.set(
      icao,
      await $fetch<IMetar>(`/api/airport/${icao}/metar`, {
        signal: current.signal,
      })
    );
  } catch {
    if (current.signal.aborted) {
      return;
    }

    decodedCache.set(icao, "error");
  }
}

onBeforeUnmount(() => {
  controller?.abort();
  decodeController?.abort();
});

const decodedRows = computed(() => {
  const m = decoded.value;
  if (!m || m === "error") {
    return [];
  }

  const wind = m.wind.degrees == null ? "VRB" : `${m.wind.degrees}º`;
  const gust = m.wind.gust_kts ? ` G${m.wind.gust_kts}` : "";
  // The parser leaves one of the two units null depending on whether the METAR uses A or Q.
  const { hg, mb } = m.barometer;
  const altimeter =
    [hg != null && `${hg.toFixed(2)} inHg`, mb != null && `${Math.round(mb)} hPa`]
      .filter(Boolean)
      .join(" · ") || "-";
  const ceiling = m.ceiling?.feet ? `${m.ceiling.feet} ft` : "None";

  return [
    { label: "Wind", value: `${wind} at ${m.wind.speed_kts} kt${gust}` },
    { label: "Visibility", value: m.visibility.miles_text ? `${m.visibility.miles_text} SM` : "-" },
    { label: "Ceiling", value: ceiling },
    { label: "Temp / Dew", value: `${m.temperature.celsius}º / ${m.dewpoint.celsius}ºC` },
    { label: "Altimeter", value: altimeter },
  ];
});
</script>

<style lang="scss" scoped>
.stations-map {
  height: calc(100vh - 220px);
  min-height: 420px;
}

.filters :deep(.btn) {
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-border-color: var(--bs-border-color);
}

.dot {
  display: inline-block;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
}
</style>

<style lang="scss">
.station-tooltip {
  pointer-events: none;
  color: #333;
  font-size: 13px;

  .maplibregl-popup-content {
    padding: 8px 10px;
    pointer-events: none;
  }

  .table {
    --bs-table-bg: transparent;
    --bs-table-color: #333;
  }
}
</style>
