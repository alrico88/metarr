<script setup lang="ts">
useSeoMeta({
  title: "metarr - METAR parser",
  description: "Check any airport's METAR in a human-readable format",
  keywords: "airport,metar,taf,free,wind,clouds,parse,human readable",
});

definePageMeta({
  layout: "with-form",
});
</script>

<template lang="pug">
.container
  .row
    .col
      .vstack.gap-3
        p.lead.mb-0 Search any airport by ICAO code to read its latest METAR and TAF in plain language: wind on each runway, flight category, clouds, visibility and more.
        saved-airports
</template>
