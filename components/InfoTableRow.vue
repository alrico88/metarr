<template lang="pug">
tr
  td.fw-bold
    slot(name="title", :title="title") {{ title }}
  td(:class="dataClass", :style="valueCellStyle")
    slot(name="value", :value="value") {{ value }}
</template>

<script setup lang="ts">
import type { StyleValue } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    value?: string | number;
    valueColor?: string;
    alignRight?: boolean;
  }>(),
  {
    value: "",
    alignRight: false,
  }
);

const dataClass = computed(() => ({
  "font-monospace": true,
  "text-end": props.alignRight,
}));

const valueCellStyle = computed(() => {
  const style: StyleValue = {};

  if (props.valueColor) {
    style.color = props.valueColor;
  }

  return style;
});
</script>
