<template lang="pug">
b-button-group
  b-button.p-2(
    variant="link",
    v-for="option of options",
    :key="option.value",
    :active="selected === option.value",
    @click="selected = option.value"
  ) {{ option.text }}
</template>

<script setup lang="ts">
const props = defineProps<{
  options: {
    text: string;
    value: string;
  }[];
}>();

const selected = defineModel<string>();
</script>

<style lang="scss" scoped>
.btn-link {
  text-underline-offset: 0.2rem;
}
</style>
