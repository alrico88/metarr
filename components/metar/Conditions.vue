<template lang="pug">
u-card
  template(#header)
    .flex.items-center.justify-between.gap-2
      div #[icon(name="bi:sun")] Conditions
      simple-chooser(:options="tempUnitsOpts", v-model="tempUnits")
  info-table(:rows="rows")
</template>

<script setup lang="ts">
import { processNumber } from "number-helper-functions";

const props = defineProps<{
  metar: IMetar;
}>();

const tempUnits = ref<"celsius" | "fahrenheit">("celsius");

const tempUnitsOpts = [
  {
    text: "ºC",
    value: "celsius",
  },
  {
    text: "ºF",
    value: "fahrenheit",
  },
];

const flightConditionColor = computed(() =>
  flightCategoryColor(props.metar.flight_category),
);

const temperature = computed(() =>
  processNumber(props.metar.temperature[tempUnits.value]),
);

const dewPoint = computed(() =>
  processNumber(props.metar.dewpoint[tempUnits.value]),
);

const rows = computed(() => [
  {
    title: "Flight conditions",
    value: props.metar.flight_category,
    color: flightConditionColor.value,
  },
  { title: "Temperature", value: temperature.value },
  { title: "Dew point", value: dewPoint.value },
  { title: "Humidity", value: `${Math.round(props.metar.humidity.percent)}%` },
]);
</script>
