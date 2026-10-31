<template lang="pug">
.container
  .row
    .col
      h2.fs-5.fw-bold Stations map
      stations-map(@select="goTo")
</template>

<script setup lang="ts">
useSeoMeta({
  title: "METAR stations map",
  description: "Live map of METAR stations colored by flight category",
  keywords: "metar,map,stations,vfr,ifr,flight category",
});

function goTo(icao: string) {
  navigateTo(`/metar/${icao}`);
}
</script>
