<template lang="pug">
b-card
  template(#header)
    .hstack.gap-2.justify-content-between.align-items-center
      div #[icon(name="bi:sun")] Conditions
      simple-chooser(:options="tempUnitsOpts", v-model="tempUnits")
  table.table.table-borderless.mb-0
    tbody
      info-table-row(
        title="Flight conditions",
        :value="metar.flight_category",
        :value-color="flightConditionColor",
        align-right
      )
      info-table-row(title="Temperature", :value="temperature", align-right)
      info-table-row(title="Dew point", :value="dewPoint", align-right)
      info-table-row(
        title="Humidity",
        :value="`${Math.round(props.metar.humidity.percent)}%`",
        align-right
      )
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
  flightCategoryColor(props.metar.flight_category)
);

const temperature = computed(() =>
  processNumber(props.metar.temperature[tempUnits.value])
);

const dewPoint = computed(() =>
  processNumber(props.metar.dewpoint[tempUnits.value])
);
</script>
