<template lang="pug">
.position-absolute.autocomplete.w-100(v-if="show")
  b-list-group.overflow-y-auto(style="max-height: 300px")
    b-list-group-item(
      v-for="(suggestion, i) of suggestions",
      :key="suggestion",
      :active="suggestionIndex === i",
      @mouseenter="suggestionIndex = i",
      @click="emit('suggestion-clicked', suggestion)",
      button
    ) {{ suggestion }}
</template>

<script setup lang="ts">
const props = defineProps<{
  suggestions: string[];
  show: boolean;
}>();

const suggestionIndex = defineModel<number>("suggestionIndex");

const emit = defineEmits<{
  (e: "suggestion-clicked", val: string): void;
}>();
</script>

<style scoped lang="scss">
.autocomplete {
  z-index: 9999;
}
</style>
