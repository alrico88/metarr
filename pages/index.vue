<script setup lang="ts">
useSeoMeta({
  title: "metarr - METAR parser",
  description: "Check any airport's METAR in a human-readable format",
  keywords: "airport,metar,taf,free,wind,clouds,parse,human readable",
});
</script>

<template lang="pug">
u-container.flex.flex-col.gap-6
  u-form-field(label="Search airport by ICAO:", :ui="{ label: 'font-bold' }")
    airport-search
  saved-airports
</template>
