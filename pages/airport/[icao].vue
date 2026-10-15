<template lang="pug">
.container
  .row
    .col
      b-overlay(:show="pending")
        b-alert(:model-value="!airportData", variant="danger") Airport not found
        airport-map(v-if="airportData", :airport="airportData", height="600px")
          b-card(header="Airport info")
            scroller-elem(:height="300")
              .vstack.gap-2
                b-list-group
                  airport-info-row(title="ICAO", :value="airportData.icao")
                  airport-info-row(
                    title="Airport name",
                    :value="airportData.name"
                  )
                  airport-info-row(
                    title="Municipality",
                    :value="airportData.municipality"
                  )
                  airport-info-row(
                    title="Elevation",
                    :value="`${airportData.elevation} feet`"
                  )
                  airport-info-row(
                    title="Runways",
                    :value="airportData.runwayCount"
                  )
                .fw-bold Runways
                b-list-group
                  airport-info-row(
                    v-for="rwy of airportData.runways",
                    :key="rwy.ident",
                    :title="rwy.ident",
                    :value="`${rwy.bearing}º`"
                  )
</template>

<script setup lang="ts">
const route = useRoute();
const icao = computed(() => route.params.icao as string);

const { data: airportData, pending } = await useFetch<Airport>(
  `/api/airport/${icao.value}/data`
);

useSeoMeta({
  title: () => `${icao.value} - ${airportData.value?.name ?? ""} Data`,
});
</script>
