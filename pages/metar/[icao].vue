<template lang="pug">
.container
  .row
    .col
      .vstack.gap-3
        airport-info(
          :icao="icao",
          :data="airportData",
          :pending="pending",
          :error="error != null"
        )
        metar-info(:icao="icao", :airport-info="airportData")
</template>

<script setup lang="ts">
const route = useRoute();
const icao = computed(() => route.params.icao as string);

definePageMeta({
  layout: "with-form",
});

const {
  data: airportData,
  error,
  pending,
} = useLazyFetch<Airport>(`/api/airport/${icao.value}/data`);

useSeoMeta({
  title: () => `${icao.value} - ${airportData.value?.name ?? ""} METAR`,
  description: () => `Check the parsed METAR data for ${icao.value}`,
});
</script>
