<template lang="pug">
b-card
  template(#header)
    .hstack.gap-2.justify-content-between.align-items-center
      div #[icon(name="tabler:eye-check")] Visibility
      simple-chooser(:options="unitOpts", v-model="units")
  table.table.table-borderless.mb-0
    tbody
      info-table-row(title="CAVOK", :value="cavok.toString()", align-right)
        template(#value="{ value }")
          icon(
            :name="value === 'true' ? 'tabler:square-rounded-check' : 'tabler:square-rounded-x'",
            :style="{ color: value === 'true' ? 'green' : 'red' }",
            size="30"
          )
      info-table-row(title="Distance", :value="visibility", align-right)
</template>

<script setup lang="ts">
import { processNumber } from "number-helper-functions";

const props = defineProps<{
  metar: IMetar;
}>();

type DistanceUnit = "meters" | "miles";

const units = ref<DistanceUnit>("meters");

const visibility = computed(() => props.metar.visibility[units.value]);

const unitOpts = [
  {
    text: "m.",
    value: "meters",
  },
  {
    text: "miles",
    value: "miles",
  },
];

const cavok = computed(() => props.metar.raw_parts.includes("CAVOK"));
</script>
