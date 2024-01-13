<template lang="pug">
icon(name="tabler:arrow-narrow-up", :style="style", size="20")
</template>

<script setup lang="ts">
const props = defineProps<{
  azimuth: number;
}>();

const style = computed(() => ({
  transform: `rotate(${props.azimuth}deg)`,
}));
</script>
