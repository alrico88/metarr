<template lang="pug">
.row
  .col
    .hstack.gap-1.align-items-center.mb-2
      h3.mb-0 Airport Info
      favorite-toggle(:icao="icao")
    template(v-if="pending")
      b-alert(variant="primary", :model-value="true")
        .hstack.gap-2.align-items-center
          b-spinner
          div Loading data
    template(v-if="!pending && (!data || error)")
      b-alert(variant="danger", :model-value="true") Airport not found
    template(v-if="!pending && data")
      .row.row-cols-1.row-cols-md-2.g-3
        .col.h-100
          b-list-group
            airport-info-row(title="ICAO", :value="data.icao")
            airport-info-row(title="Airport name", :value="data.name")
            airport-info-row(title="Municipality", :value="data.municipality")
            airport-info-row(
              title="Elevation",
              :value="`${data.elevation} feet`"
            )
            airport-info-row(title="Runways", :value="data.runwayCount")
        .col.h-100
          airport-map(:airport="data", height="200px")
          .text-center
            nuxt-link(:to="`/airport/${data.icao}`") View map
</template>

<script setup lang="ts">
const props = defineProps<{
  icao: string;
  pending: boolean;
  error: boolean;
  data: Airport | null;
}>();
</script>
