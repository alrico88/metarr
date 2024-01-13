<template lang="pug">
b-list-group-item
  .hstack.gap-2.justify-content-between
    .fw-bold {{ title }}
    .text-truncate.font-monospace(:title="value.toString()") {{ value }}
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: string | number;
}>();
</script>
