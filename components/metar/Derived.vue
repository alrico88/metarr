<script setup lang="ts">
import is from "@sindresorhus/is";
import { processNumber } from "number-helper-functions";

const props = defineProps<{
  metar: IMetar;
  airportInfo: Airport | null;
}>();

const FOG_RISK_SPREAD_C = 2;

const spread = computed(
  () => props.metar.temperature.celsius - props.metar.dewpoint.celsius,
);

const fogRisk = computed(() => spread.value <= FOG_RISK_SPREAD_C);

const elevation = computed(() => props.airportInfo?.elevation);

const pressureAlt = computed(() =>
  is.number(elevation.value)
    ? `${Math.round(pressureAltitude(elevation.value, props.metar.barometer.mb))} ft`
    : "–",
);

const densityAlt = computed(() =>
  is.number(elevation.value)
    ? `${Math.round(
      densityAltitude(
        elevation.value,
        props.metar.barometer.mb,
        props.metar.temperature.celsius,
      ),
    )} ft`
    : "–",
);

const rows = computed(() => [
  { title: "Temp/dew point spread", value: `${processNumber(spread.value, 1)} ºC` },
  { title: "Pressure altitude", value: pressureAlt.value },
  { title: "Density altitude", value: densityAlt.value },
]);
</script>

<template lang="pug">
u-card
  template(#header) #[icon(name="bi:calculator")] Derived
  info-table(:rows="rows")
  u-alert.m-3.mt-0(
    v-if="fogRisk",
    color="warning",
    variant="subtle",
    title="Small spread: fog or low clouds likely"
  )
</template>
