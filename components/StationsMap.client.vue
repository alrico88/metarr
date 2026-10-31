<template lang="pug">
.stations-map.relative.overflow-hidden.rounded-lg.border.border-default
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
        .mb-1.flex.items-center.gap-2
          strong {{ hovered.icao }}
          flight-category-badge(:category="hovered.flight_category")
        .mb-2.font-mono.text-xs {{ hovered.metar }}
        table.w-full(v-if="decodedRows.length")
          tbody
            tr(v-for="row of decodedRows", :key="row.label")
              th.pr-3.text-left.font-normal.opacity-60 {{ row.label }}
              td {{ row.value }}
        .text-xs.opacity-60(v-else-if="decoded === 'error'") Couldn't decode this METAR
        .flex.items-center.gap-2.text-xs.opacity-60(v-else)
          icon.animate-spin(name="i-lucide-loader-circle")
          | Decoding...
  .absolute.left-0.top-0.mt-2.flex.gap-1.overflow-x-auto(class="ml-[3.2rem] mr-36 sm:mr-0 sm:flex-wrap")
    u-button(
      v-for="c of CONDITIONS",
      :key="c.value",
      size="xs",
      color="neutral",
      class="shrink-0 whitespace-nowrap",
      :variant="conditions.includes(c.value) ? 'solid' : 'outline'",
      :label="c.text",
      :aria-pressed="conditions.includes(c.value)",
      @click="toggleCondition(c.value)"
    )
  .absolute.bottom-0.right-0.m-2.rounded.bg-default.px-3.py-1.text-sm(class="mb-14 sm:mb-8")
    u-switch(v-model="showClouds", label="Clouds (IR)", size="sm")
  .absolute.right-0.top-0.m-2
    u-badge(v-if="zoomedOut", color="neutral", variant="subtle", label="Zoom in to see stations")
    u-badge(v-else-if="loading", color="neutral", variant="subtle", icon="i-lucide-loader-circle", :ui="{ leadingIcon: 'animate-spin' }", label="Loading stations")
    u-badge(v-else-if="failed", color="error", variant="subtle", label="Couldn't load stations")
    u-badge(v-else, color="neutral", variant="outline", :label="`${visibleStations.length} / ${stations.length} stations`")
  u-card.absolute.bottom-0.left-0.m-2.text-sm(class="mb-14 sm:mb-2", :ui="{ body: 'p-2 sm:p-2' }")
    u-checkbox-group(v-model="categories", :items="CATEGORY_ITEMS", size="sm", :ui="{ fieldset: 'gap-1' }")
      template(#label="{ item }")
        span.dot.mr-1(:style="{ backgroundColor: flightCategoryColor(item.value) }")
        | {{ item.label }}
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
    ...["VFR", "MVFR", "IFR", "LIFR"].flatMap(c => [c, flightCategoryColor(c)]),
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
const CATEGORY_ITEMS = CATEGORIES.map(c => ({ label: c, value: c }));

const showClouds = useLocalStorage("metarr:map-clouds", false);

const categories = ref([...CATEGORIES]);
const conditions = ref<string[]>([]);

function toggleCondition(value: string) {
  conditions.value = conditions.value.includes(value)
    ? conditions.value.filter(c => c !== value)
    : [...conditions.value, value];
}

const stations = shallowRef<MapStation[]>([]);
const visibleStations = computed(() => {
  const tests = CONDITIONS.filter(c => conditions.value.includes(c.value));
  return stations.value.filter(
    s =>
      (!CATEGORIES.includes(s.flight_category) || categories.value.includes(s.flight_category))
      && tests.every(c => c.test(s)),
  );
});
const loading = ref(false);
const failed = ref(false);
const zoomedOut = ref(false);
const hovered = shallowRef<MapStation | null>(null);

const decodedCache = reactive(new Map<string, IMetar | "error">());
const decoded = computed(() =>
  hovered.value ? decodedCache.get(hovered.value.icao) : undefined,
);

const geoJson = computed(() => ({
  type: "FeatureCollection" as const,
  features: visibleStations.value.map(s => ({
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
    fetchedBox
    && view.west >= fetchedBox.west
    && view.east <= fetchedBox.east
    && view.south >= fetchedBox.south
    && view.north <= fetchedBox.north
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
  const station = stations.value.find(s => s.icao === icao) ?? null;

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
      }),
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
  const altimeter
    = [hg != null && `${hg.toFixed(2)} inHg`, mb != null && `${Math.round(mb)} hPa`]
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

<style scoped>
.stations-map {
  height: calc(100vh - 220px);
  min-height: 420px;
}

.dot {
  display: inline-block;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
}
</style>

<style>
.station-tooltip {
  pointer-events: none;
  color: #333;
  font-size: 13px;
}

.station-tooltip .maplibregl-popup-content {
  padding: 8px 10px;
  pointer-events: none;
}
</style>
