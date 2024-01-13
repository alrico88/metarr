<template lang="pug">
b-card(no-body)
  template(#header)
    .hstack.gap-2.justify-content-between.align-items-center
      div #[icon(name="bi:wind")] Wind
      simple-chooser(:options="windUnitsOpts", v-model="windUnits")
  b-card-body.p-0
    .p-4
      .row
        .col
          h5.fw-bold Speed:
          .font-monospace {{ windSpeed }} {{ windUnitsText }}
        .col
          h5.fw-bold Gusting to:
          .font-monospace {{ gustsSpeed }} {{ windUnitsText }}
        .col
          h5.fw-bold From:
          .font-monospace {{ metar.wind.degrees }}º
    .row
      .col
        data-table.mb-0(
          :fields="fields",
          :items="runwayInfo",
          bordered,
          sort-column="ident",
          empty-text="No runway data"
        )
          template(#cell(windDirection)="{ value }")
            div(v-if="value")
              heading-arrow(:azimuth="asNumber(value)")
            div(v-else) ??
</template>
ß
<script setup lang="ts">
import is from "@sindresorhus/is";
import { processNumber } from "number-helper-functions";
import type { FieldDef } from "../DataTable.vue";

const props = defineProps<{
  metar: IMetar;
  airportInfo: Airport | null;
}>();

const windUnits = ref<"kts" | "mps">("kts");

const windUnitsOpts = [
  {
    text: "ms/s",
    value: "mps",
  },
  {
    text: "Knots",
    value: "kts",
  },
];

const windSpeed = computed(() =>
  processNumber(props.metar.wind[`speed_${windUnits.value}`])
);
const gustsSpeed = computed(() =>
  processNumber(props.metar.wind[`gust_${windUnits.value}`])
);
const windUnitsText = computed(
  () => windUnitsOpts.find((d) => d.value === windUnits.value)?.text
);

function feetToMeters(feet: number): number {
  return feet / 3.281;
}

const { getAzimuth } = useGeography();

const fields: FieldDef[] = [
  {
    label: "Rwy.",
    key: "ident",
    sortable: true,
  },
  {
    label: "Surface",
    key: "surface",
    sortable: true,
  },
  {
    label: "Length",
    key: "lengthInKm",
    sortable: true,
    formatter: (d) => `${d} km.`,
  },
  {
    label: "Width",
    key: "widthInM",
    sortable: true,
    formatter: (d) => `${d} m.`,
  },
  {
    label: "Wind",
    key: "windDirection",
    sortable: true,
  },
];

const runwayInfo = computed(() => {
  if (is.nullOrUndefined(props.airportInfo)) {
    return [];
  }

  return props.airportInfo.runways.map(
    ({ ident, bearing, surface, length, width }) => {
      const lengthInKm = processNumber(feetToMeters(length) / 1000, 1);
      const widthInM = processNumber(feetToMeters(width), 1);

      let windDirection: null | number = null;

      if (props.metar.wind.degrees) {
        windDirection = getAzimuth(props.metar.wind.degrees - bearing) - 180;
      }

      return {
        ident,
        surface,
        lengthInKm,
        widthInM,
        windDirection,
      };
    }
  );
});

function asNumber(d: unknown): number {
  return d as number;
}
</script>

<style lang="scss" scoped>
h5 {
  font-size: 1.2rem;
}
</style>
