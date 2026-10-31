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
      saved-airports
</template>
