<script setup lang="ts">
const props = defineProps<{
  title: string;
  icaos: readonly string[];
  emptyText: string;
  clearable?: boolean;
}>();

const emit = defineEmits<{ clear: []; remove: [icao: string] }>();
</script>

<template lang="pug">
b-card
  template(#header)
    .hstack.gap-2.justify-content-between.align-items-center
      div {{ title }}
      b-button(
        v-if="clearable && icaos.length",
        variant="link",
        size="sm",
        class="p-0",
        @click="emit('clear')"
      ) Clear
  .hstack.gap-2.flex-wrap(v-if="icaos.length")
    b-button-group(v-for="icao of icaos", :key="icao", size="sm")
      b-button.font-monospace(
        :to="`/metar/${icao}`",
        variant="outline-primary"
      ) {{ icao }}
      b-button(
        variant="outline-primary",
        :aria-label="`Remove ${icao}`",
        :title="`Remove ${icao}`",
        @click="emit('remove', icao)"
      ) #[icon(name="bi:x-lg")]
  .text-muted(v-else) {{ emptyText }}
</template>
