<script setup lang="ts">
import is from "@sindresorhus/is";
import { maxBy } from "es-toolkit";
import { processNumber } from "number-helper-functions";
import type { FieldDef } from "../DataTable.vue";

const props = defineProps<{
  metar: IMetar;
  airportInfo: Airport | null;
}>();

const windUnits = shallowRef<"kts" | "mps">("kts");

const windUnitsOpts = [
  {
    text: "m/s",
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
const windFrom = computed(() =>
  is.nullOrUndefined(props.metar.wind.degrees)
    ? "VRB"
    : `${props.metar.wind.degrees}º`
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
  {
    label: "Head/tail",
    key: "headwind",
    sortable: true,
  },
  {
    label: "Cross",
    key: "crosswind",
    sortable: true,
  },
];

const hasDirectionalWind = computed(
  () =>
    !is.nullOrUndefined(props.metar.wind.degrees) &&
    props.metar.wind.speed_kts > 0
);

const runwayInfo = computed(() => {
  if (is.nullOrUndefined(props.airportInfo)) {
    return [];
  }

  const { degrees } = props.metar.wind;
  const speed = props.metar.wind[`speed_${windUnits.value}`];

  return props.airportInfo.runways.map(
    ({ ident, bearing, surface, length, width }) => {
      const lengthInKm = processNumber(feetToMeters(length) / 1000, 1);
      const widthInM = processNumber(feetToMeters(width), 1);

      const components = hasDirectionalWind.value
        ? runwayWindComponents(degrees, speed, bearing)
        : null;

      return {
        ident,
        surface,
        lengthInKm,
        widthInM,
        windDirection: components ? getAzimuth(degrees - bearing) - 180 : null,
        headwind: components ? processNumber(components.headwind, 1) : null,
        crosswind: components ? processNumber(components.crosswind, 1) : null,
      };
    }
  );
});

const favoredRunway = computed(
  () =>
    maxBy(
      runwayInfo.value.filter((d) => d.headwind !== null),
      (d) => d.headwind as number
    )?.ident
);

function formatHeadwind(value: unknown): string {
  if (!is.number(value)) {
    return "–";
  }

  return value >= 0 ? `H ${value}` : `T ${Math.abs(value)}`;
}

function formatCrosswind(value: unknown): string {
  if (!is.number(value)) {
    return "–";
  }

  if (value === 0) {
    return "0";
  }

  return value > 0 ? `${value} R` : `${Math.abs(value)} L`;
}

function asNumber(d: unknown): number {
  return d as number;
}
</script>

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
          .font-monospace {{ windFrom }}
    .row
      .col
        data-table.mb-0(
          :fields="fields",
          :items="runwayInfo",
          bordered,
          sort-column="ident",
          empty-text="No runway data"
        )
          template(#cell(ident)="{ value }")
            .hstack.gap-2.align-items-center
              div {{ value }}
              b-badge(v-if="value === favoredRunway", variant="success") Favored
          template(#cell(windDirection)="{ value }")
            div(v-if="value !== null")
              heading-arrow(:azimuth="asNumber(value)")
            div(v-else) –
          template(#cell(headwind)="{ value }")
            .font-monospace.text-nowrap {{ formatHeadwind(value) }}
          template(#cell(crosswind)="{ value }")
            .font-monospace.text-nowrap {{ formatCrosswind(value) }}
</template>

<style lang="scss" scoped>
h5 {
  font-size: 1.2rem;
}
</style>
