<template lang="pug">
.row
  .col
    h3 Airport Info
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
          l-map.border.rounded(
            :center="[data.latitude, data.longitude]",
            :zoom="10",
            :style="{ height: '200px' }"
          )
            l-tile-layer(:url="tileUrl", :attribution="tileAttribution")
            l-marker(:lat-lng="[data.latitude, data.longitude]")
              l-tooltip(:content="data.icao")
          .text-center
            nuxt-link(:to="`/airport/${data.icao}`") View map
</template>

<script setup lang="ts">
const props = defineProps<{
  pending: boolean;
  error: boolean;
  data: Airport | null;
}>();

const { tileUrl, tileAttribution } = useTile();
</script>
