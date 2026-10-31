<script setup lang="ts">
const props = defineProps<{
  icao: string;
}>();

const { isFavorite, toggleFavorite } = useSavedAirports();

const favorite = computed(() => isFavorite(props.icao));
const label = computed(() =>
  favorite.value ? "Remove from favorites" : "Add to favorites"
);
</script>

<template lang="pug">
b-button(
  variant="link",
  size="sm",
  :aria-label="label",
  :title="label",
  :aria-pressed="favorite",
  @click="toggleFavorite(icao)"
)
  icon(:name="favorite ? 'bi:star-fill' : 'bi:star'", size="20")
</template>
