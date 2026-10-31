<template lang="pug">
u-tabs(
  v-model="selected",
  :items="items",
  :content="false",
  variant="pill",
  size="xs",
  color="neutral",
  :ui="{ root: 'w-auto', list: 'w-auto', trigger: 'px-2' }"
)
</template>

<script setup lang="ts">
const props = defineProps<{
  options: {
    text: string;
    value: string;
  }[];
}>();

const selected = defineModel<string>();

const items = computed(() =>
  props.options.map(option => ({ label: option.text, value: option.value })),
);
</script>
