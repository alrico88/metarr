<template lang="pug">
u-container
  u-alert(v-if="!pending && !airportData", color="error", variant="subtle", title="Airport not found")
  .relative(v-else)
    airport-map(v-if="airportData", :airport="airportData", height="600px")
      u-card.w-64(class="sm:w-80", :ui="{ body: 'p-3 sm:p-3' }")
        template(#header) Airport info
        scroller-elem(:height="480")
          .flex.flex-col.gap-2
            info-table(:rows="infoRows")
            .font-bold Runways
            info-table(:rows="runwayRows")
</template>

<script setup lang="ts">
const route = useRoute();
const icao = computed(() => route.params.icao as string);

const { data: airportData, pending } = await useFetch<Airport>(
  `/api/airport/${icao.value}/data`,
);

useSeoMeta({
  title: () => `${icao.value} - ${airportData.value?.name ?? ""} Data`,
});

const infoRows = computed(() => {
  const d = airportData.value;

  return d
    ? [
        { title: "ICAO", value: d.icao },
        { title: "Airport name", value: d.name },
        { title: "Municipality", value: d.municipality },
        { title: "Elevation", value: `${d.elevation} feet` },
        { title: "Runways", value: d.runwayCount },
      ]
    : [];
});

const runwayRows = computed(() =>
  (airportData.value?.runways ?? []).map(rwy => ({
    title: rwy.ident,
    value: `${rwy.bearing}º`,
  })),
);
</script>
