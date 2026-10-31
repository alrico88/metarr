<script setup lang="ts">
const props = defineProps<{
  icao: string;
}>();

const { isFavorite, toggleFavorite } = useSavedAirports();

const favorite = computed(() => isFavorite(props.icao));
const label = computed(() =>
  favorite.value ? "Remove from favorites" : "Add to favorites",
);
</script>

<template lang="pug">
u-button(
  :variant="favorite ? 'soft' : 'outline'",
  size="sm",
  :icon="favorite ? 'bi:star-fill' : 'bi:star'",
  :label="label",
  :aria-pressed="favorite",
  @click="toggleFavorite(icao)"
)
</template>
