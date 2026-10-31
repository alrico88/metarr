<template lang="pug">
u-card
  template(#header)
    .flex.items-center.justify-between.gap-2
      div #[icon(name="tabler:eye-check")] Visibility
      simple-chooser(:options="unitOpts", v-model="units")
  info-table(:rows="rows")
    template(#value="{ row }")
      icon(
        v-if="row.title === 'CAVOK'",
        :name="cavok ? 'tabler:square-rounded-check' : 'tabler:square-rounded-x'",
        :style="{ color: cavok ? 'green' : 'red' }",
        size="30"
      )
      .font-mono(v-else) {{ row.value }}
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

const rows = computed(() => [
  { title: "CAVOK", value: cavok.value.toString() },
  { title: "Distance", value: visibility.value },
]);
</script>
