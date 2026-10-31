<template lang="pug">
div
  .mb-2.flex.flex-wrap.items-center.justify-between.gap-2
    h3.text-2xl.font-medium Airport Info
    .flex.items-center.gap-2
      u-button(
        v-if="data",
        :to="`/airport/${data.icao}`",
        variant="outline",
        size="sm",
        icon="bi:map",
        label="View map"
      )
      favorite-toggle(:icao="icao")
  u-alert(v-if="pending", color="primary", variant="subtle", title="Loading data", icon="i-lucide-loader-circle", :ui="{ leadingIcon: 'animate-spin' }")
  u-alert(v-else-if="!data || error", color="error", variant="subtle", title="Airport not found")
  .grid.grid-cols-1.items-start.gap-4(v-else, class="md:grid-cols-2")
    u-card
      info-table(:rows="rows")
    airport-map(:airport="data", height="200px")
</template>

<script setup lang="ts">
const props = defineProps<{
  icao: string;
  pending: boolean;
  error: boolean;
  data: Airport | null;
}>();

const rows = computed(() =>
  props.data
    ? [
        { title: "ICAO", value: props.data.icao },
        { title: "Airport name", value: props.data.name },
        { title: "Municipality", value: props.data.municipality },
        { title: "Elevation", value: `${props.data.elevation} feet` },
        { title: "Runways", value: props.data.runwayCount },
      ]
    : [],
);
</script>
