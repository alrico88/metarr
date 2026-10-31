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
u-card(:ui="{ body: 'p-4 sm:p-4' }")
  template(#header)
    .flex.items-center.justify-between.gap-2
      div {{ title }}
      u-button(
        v-if="clearable && icaos.length",
        variant="link",
        size="xs",
        label="Clear",
        @click="emit('clear')"
      )
  .flex.flex-wrap.gap-2(v-if="icaos.length")
    u-field-group(v-for="icao of icaos", :key="icao")
      u-button.font-mono(
        :to="`/metar/${icao}`",
        variant="outline",
        size="sm",
        :label="icao"
      )
      u-button(
        variant="outline",
        size="sm",
        icon="bi:x-lg",
        :aria-label="`Remove ${icao}`",
        :title="`Remove ${icao}`",
        @click="emit('remove', icao)"
      )
  .text-muted(v-else) {{ emptyText }}
</template>
