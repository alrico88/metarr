<template lang="pug">
u-badge(v-if="category", color="neutral", :label="category", :style="style", class="text-white")
</template>

<script setup lang="ts">
const props = defineProps<{
  category?: string;
}>();

const style = computed(() => ({
  backgroundColor: flightCategoryColor(props.category),
}));
</script>
