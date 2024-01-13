<template lang="pug">
.overflow-y-auto.scroller
  slot
</template>

<script setup lang="ts">
const props = defineProps<{
  height?: number;
}>();

const maxHeight = computed(() => (props.height ? `${props.height}px` : "auto"));
</script>

<style lang="scss" scoped>
.scroller {
  max-height: v-bind("maxHeight");
}
</style>
