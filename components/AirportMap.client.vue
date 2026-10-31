<script setup lang="ts">
import {
  MglCustomControl,
  MglMap,
  MglNavigationControl,
} from "@indoorequal/vue-maplibre-gl";

const props = withDefaults(
  defineProps<{
    airport: Airport;
    height?: string;
  }>(),
  { height: "200px" },
);

const mapStyle = useMapStyle();

const center = computed<[number, number]>(() => [
  props.airport.longitude,
  props.airport.latitude,
]);
</script>

<template lang="pug">
.overflow-hidden.rounded-lg.border.border-default(:style="{ height }")
  mgl-map(:map-style="mapStyle", :center="center", :zoom="10")
    mgl-navigation-control(position="top-left")
    map-marker(:coordinates="center", :label="airport.icao")
    mgl-custom-control.maplibregl-ctrl.airport-map-info(
      v-if="$slots.default",
      position="top-right"
    )
      div(
        @wheel.stop,
        @mousedown.stop,
        @dblclick.stop,
        @touchstart.stop,
        @click.stop
      )
        slot
</template>

<style scoped>
:deep(.airport-map-info) {
  max-width: min(400px, calc(100% - 20px));
  font-family: var(--font-sans);
  font-size: 1rem;
}
</style>
