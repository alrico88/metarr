<template lang="pug">
.container
  .row
    .col
      .hstack.gap-2.align-items-center.mb-2
        div
          b-form-select(:options="[10, 20, 30]", v-model="nearestAmount")
        .flex-grow-1
          h2.mb-0 Nearest METAR stations
      b-alert.mb-0(variant="primary", :model-value="loadingSome")
        .hstack.gap-2
          b-spinner
          div Loading
      b-alert.mb-0(variant="danger", :model-value="userPositionError") Error getting coords. Did you allow geolocation?
      template(v-if="!loadingSome && userPosition")
        .vstack.gap-3
          l-map.border.rounded(
            :center="[userPosition.coords.latitude, userPosition.coords.longitude]",
            :zoom="4",
            :style="{ height: '300px' }",
            ref="mapRef"
          )
            l-marker(
              :lat-lng="[userPosition.coords.latitude, userPosition.coords.longitude]"
            )
              l-icon(
                icon-url="/crosshair.png",
                :icon-size="[30, 30]",
                :icon-anchor="[15, 15]"
              )
              l-tooltip(content="Your position")
            l-tile-layer(:url="tileUrl", :attribution="tileAttribution")
            l-marker(
              v-for="item of stations",
              :key="item.station.icao + item.station.name",
              :lat-lng="[item.station.latitude, item.station.longitude]",
              @click="goTo(item)"
            )
              l-tooltip(:content="item.station.icao")
          data-table(
            v-if="stations",
            :fields="fields",
            sort-by="nautical_miles",
            :items="stations",
            bordered
          )
            template(#cell(bearing)="{ value }")
              .hstack.gap-2.align-items-center.justify-content-between
                div {{ value }}
                heading-arrow(:azimuth="asNum(value)")
            template(#cell(metar)="{ value }")
              .font-monospace {{ value }}
            template(#cell(actions)="{ item }")
              b-button.text-nowrap(@click="goTo(item)", variant="primary") Check METAR
</template>

<script setup lang="ts">
import is from "@sindresorhus/is";
import { getDatasetBBox } from "bbox-helper-functions";
import CheapRuler from "cheap-ruler";
import { processNumber } from "number-helper-functions";
import type { FieldDef } from "~/components/DataTable.vue";

useSeoMeta({
  title: "Nearest METAR stations to me",
  description: "Find the METAR stations nearest to your geolocation",
  keywords: "metar,near,station,position,geolocation",
});

const { tileUrl, tileAttribution } = useTile();

const { getAzimuth } = useGeography();

const coordsLoading = ref(true);
const userPosition = ref<GeolocationPosition | null>(null);
const userPositionError = ref(false);

onMounted(() => {
  import("leaflet");
});

onNuxtReady(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userPosition.value = position;

      coordsLoading.value = false;
    },
    (err) => {
      userPositionError.value = true;

      console.error(err);

      coordsLoading.value = false;
    }
  );
});

const nearestAmount = ref(10);

const { data: stations, pending: stationsLoading } = useAsyncData(
  async () => {
    if (
      is.nullOrUndefined(userPosition.value) ||
      is.nullOrUndefined(userPosition.value.coords.latitude) ||
      is.nullOrUndefined(userPosition.value.coords.longitude)
    ) {
      return [];
    }

    const [latitude, longitude] = [
      userPosition.value.coords.latitude,
      userPosition.value.coords.longitude,
    ];

    const st = await $fetch<NearestAirport[]>("/api/stations/nearest", {
      query: {
        latitude,
        longitude,
        amount: nearestAmount.value,
      },
    });

    if (is.emptyArray(st)) {
      return [];
    }

    const ruler = new CheapRuler(st[0].station.latitude);

    return st.map((d) => ({
      ...d,
      bearing: getAzimuth(
        ruler.bearing(
          [longitude, latitude],
          [d.station.longitude, d.station.latitude]
        )
      ),
    }));
  },
  {
    watch: [userPosition, nearestAmount],
  }
);

const bounds = computed(() => {
  if (is.nonEmptyArray(stations.value)) {
    const [minLon, minLat, maxLon, maxLat] = getDatasetBBox(stations.value, {
      latitudeAccessor: (d: NearestAirport) => d.station.latitude,
      longitudeAccessor: (d: NearestAirport) => d.station.longitude,
    });

    return [
      [minLat, minLon],
      [maxLat, maxLon],
    ];
  } else {
    return [
      [-90, -180],
      [90, 180],
    ];
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapRef = templateRef<any>("mapRef");

watchEffect(() => {
  mapRef.value?.leafletObject.fitBounds(bounds.value);
});

const loadingSome = computed(
  () => coordsLoading.value || stationsLoading.value
);

const fields: FieldDef[] = [
  {
    label: "ICAO",
    key: "station.icao",
    sortable: true,
  },
  {
    label: "Name",
    key: "station.name",
    sortable: true,
  },
  {
    label: "Bearing",
    key: "bearing",
    sortable: true,
  },
  {
    label: "Distance",
    key: "nautical_miles",
    sortable: true,
    formatter: (d) => processNumber(d as string).toString(),
  },
  {
    label: "METAR",
    key: "metar",
  },
  {
    label: "Actions",
    key: "actions",
  },
];

function goTo(item: unknown) {
  navigateTo(`/metar/${(item as NearestAirport).station.icao}`);
}

function asNum(d: unknown): number {
  return d as number;
}
</script>

<style lang="scss" scoped>
h2 {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
