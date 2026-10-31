<template lang="pug">
span.badge(v-if="category", :style="style") {{ category }}
</template>

<script setup lang="ts">
const props = defineProps<{
  category?: string;
}>();

const style = computed(() => ({
  backgroundColor: flightCategoryColor(props.category),
}));
</script>
