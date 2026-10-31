<script setup lang="ts">
defineProps<{
  title: string;
  icaos: readonly string[];
  emptyText: string;
}>();
</script>

<template lang="pug">
b-card(:header="title")
  .hstack.gap-2.flex-wrap(v-if="icaos.length")
    b-button.font-monospace(
      v-for="icao of icaos",
      :key="icao",
      :to="`/metar/${icao}`",
      variant="outline-primary",
      size="sm"
    ) {{ icao }}
  .text-muted(v-else) {{ emptyText }}
</template>
