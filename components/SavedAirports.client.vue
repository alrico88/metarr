<script setup lang="ts">
const { favorites, recents } = useSavedAirports();
</script>

<template lang="pug">
.row.row-cols-1.row-cols-md-2.g-3
  .col
    airport-shortcuts(
      title="Favorites",
      :icaos="favorites",
      empty-text="Star an airport on its METAR page to pin it here."
    )
  .col
    airport-shortcuts(
      title="Recently viewed",
      :icaos="recents",
      empty-text="Airports you check will show up here."
    )
</template>
