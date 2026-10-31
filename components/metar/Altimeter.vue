<template lang="pug">
u-card
  template(#header)
    .flex.items-center.justify-between.gap-2
      div #[icon(name="mdi:altimeter")] Altimeter
  info-table(:rows="rows")
</template>

<script setup lang="ts">
import { processNumber } from "number-helper-functions";

const props = defineProps<{
  metar: IMetar;
}>();

const rows = computed(() => [
  { title: "Inches", value: processNumber(props.metar.barometer.hg) },
  { title: "Millibars", value: processNumber(props.metar.barometer.mb) },
]);
</script>
