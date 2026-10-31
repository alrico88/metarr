<script setup lang="ts">
const {
  favorites,
  recents,
  removeFavorite,
  removeRecent,
  clearRecents,
} = useSavedAirports();
</script>

<template lang="pug">
.grid.grid-cols-1.gap-4(class="md:grid-cols-2")
  airport-shortcuts(
    title="Favorites",
    :icaos="favorites",
    @remove="removeFavorite",
    empty-text="Star an airport on its METAR page to pin it here."
  )
  airport-shortcuts(
    title="Recently viewed",
    :icaos="recents",
    clearable,
    @clear="clearRecents",
    @remove="removeRecent",
    empty-text="Airports you check will show up here."
  )
</template>
