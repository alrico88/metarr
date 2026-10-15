<script setup lang="ts">
import { MglMarker, MglPopup } from "@indoorequal/vue-maplibre-gl";

const props = withDefaults(
  defineProps<{
    coordinates: [number, number];
    label: string;
    actionLabel?: string;
    anchor?: "center" | "bottom";
  }>(),
  { actionLabel: undefined, anchor: "bottom" }
);

const emit = defineEmits<{ select: [] }>();
const hovered = ref(false);
const focused = ref(false);
const dismissed = ref(false);
const tooltipVisible = computed(
  () => (hovered.value || focused.value) && !dismissed.value
);
</script>

<template lang="pug">
mgl-marker(:coordinates="coordinates", :anchor="anchor")
  template(#marker)
    button.map-marker(
      type="button",
      :aria-label="actionLabel ?? label",
      @mouseenter="hovered = true; dismissed = false",
      @mouseleave="hovered = false",
      @focus="focused = true; dismissed = false",
      @blur="focused = false",
      @keydown.esc="dismissed = true",
      @click.stop="emit('select')"
    )
      slot
        svg(width="27", height="41", viewBox="0 0 27 41", aria-hidden="true")
          path(
            d="M13.5 40S1 24 1 14a12.5 12.5 0 0 1 25 0C26 24 13.5 40 13.5 40Z",
            fill="#3b82b5",
            stroke="white",
            stroke-width="2"
          )
          circle(cx="13.5", cy="14", r="4", fill="white")
mgl-popup(
  v-if="tooltipVisible",
  :coordinates="coordinates",
  :offset="30",
  :close-button="false",
  :close-on-click="false",
  :focus-after-open="false",
  class-name="map-marker-tooltip"
)
  span(role="tooltip") {{ label }}
</template>

<style lang="scss" scoped>
.map-marker {
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}
</style>

<style lang="scss">
.map-marker-tooltip {
  pointer-events: none;
  color: #333;
  font:
    12px/1.5 "Helvetica Neue",
    Arial,
    Helvetica,
    sans-serif;
}

.map-marker-tooltip .maplibregl-popup-content {
  padding: 6px;
  pointer-events: none;
}
</style>
