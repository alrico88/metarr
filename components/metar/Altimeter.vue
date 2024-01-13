<template lang="pug">
b-card
  template(#header)
    .hstack.gap-2.justify-content-between.align-items-center
      div #[icon(name="mdi:altimeter")] Altimeter
  table.table.table-borderless.mb-0
    tbody
      info-table-row(
        title="Inches",
        :value="processNumber(metar.barometer.hg)",
        align-right
      )
      info-table-row(
        title="Millibars",
        :value="processNumber(metar.barometer.mb)",
        align-right
      )
</template>

<script setup lang="ts">
import { processNumber } from "number-helper-functions";

const props = defineProps<{
  metar: IMetar;
}>();
</script>
