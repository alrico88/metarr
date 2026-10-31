<template lang="pug">
u-container
  .mb-2.flex.items-center.gap-2
    u-select.w-24(:items="[10, 20, 30]", v-model="nearestAmount")
    h2.text-lg.font-bold Nearest METAR stations
  u-alert(v-if="loadingSome", color="primary", variant="subtle", title="Loading", icon="i-lucide-loader-circle", :ui="{ leadingIcon: 'animate-spin' }")
  u-alert(v-if="userPositionError", color="error", variant="subtle", title="Error getting coords. Did you allow geolocation?")
  .flex.flex-col.gap-4(v-if="!loadingSome && userPosition")
    nearest-stations-map(
      :position="userPosition.coords",
      :stations="stations ?? []",
      @select="goTo"
    )
    data-table(
      v-if="stations",
      :fields="fields",
      :items="stations",
      bordered,
      striped,
    )
      template(#cell(bearing)="{ value }")
        .flex.items-center.justify-between.gap-2
          div {{ value }}
          heading-arrow(:azimuth="asNum(value)")
      template(#cell(flight_category)="{ value }")
        flight-category-badge(:category="asString(value)")
      template(#cell(metar)="{ value }")
        .min-w-44.whitespace-normal.break-words.font-mono.text-xs {{ value }}
      template(#cell(actions)="{ item }")
        u-button.whitespace-nowrap(label="Check METAR", @click="goTo(item)")
</template>

<script setup lang="ts">
import is from "@sindresorhus/is";
import CheapRuler from "cheap-ruler";
import { processNumber } from "number-helper-functions";
import type { FieldDef } from "~/components/DataTable.vue";

useSeoMeta({
  title: "Nearest METAR stations to me",
  description: "Find the METAR stations nearest to your geolocation",
  keywords: "metar,near,station,position,geolocation",
});

const { getAzimuth } = useGeography();

const coordsLoading = ref(true);
const userPosition = ref<GeolocationPosition | null>(null);
const userPositionError = ref(false);

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
    },
  );
});

const nearestAmount = ref(10);

const { data: stations, pending: stationsLoading } = useAsyncData(
  async () => {
    if (
      is.nullOrUndefined(userPosition.value)
      || is.nullOrUndefined(userPosition.value.coords.latitude)
      || is.nullOrUndefined(userPosition.value.coords.longitude)
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

    const ruler = new CheapRuler(st[0]?.station.latitude ?? 0);

    return st.map(d => ({
      ...d,
      bearing: getAzimuth(
        ruler.bearing(
          [longitude, latitude],
          [d.station.longitude, d.station.latitude],
        ),
      ),
    }));
  },
  {
    watch: [userPosition, nearestAmount],
  },
);

const loadingSome = computed(
  () => coordsLoading.value || stationsLoading.value,
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
    formatter: d => processNumber(d as string).toString(),
  },
  {
    label: "Category",
    key: "flight_category",
    sortable: true,
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

function asString(d: unknown): string {
  return d as string;
}
</script>
