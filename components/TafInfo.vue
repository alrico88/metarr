<script setup lang="ts">
const props = defineProps<{
  icao: string;
}>();

const {
  data: taf,
  pending,
  error,
  refresh,
} = useLazyFetch<{ raw: string }>(() => `/api/airport/${props.icao}/taf`);

const failed = computed(
  () => !!error.value && !isClientError(error.value.statusCode),
);
</script>

<template lang="pug">
div
  h3.text-2xl.font-medium.mb-2 TAF:
  u-alert(v-if="pending && !taf", color="primary", variant="subtle", title="Loading data", icon="i-lucide-loader-circle", :ui="{ leadingIcon: 'animate-spin' }")
  u-alert(
    v-else-if="failed",
    color="error",
    variant="subtle",
    title="Couldn't load the TAF",
    :actions="[{ label: 'Retry', color: 'error', onClick: () => refresh() }]"
  )
  u-alert(v-else-if="!taf", color="neutral", variant="subtle", title="No TAF available for this station")
  u-alert(v-else, color="primary", variant="subtle")
    template(#description)
      pre.font-mono.taf {{ taf.raw }}
</template>

<style scoped>
.taf {
  white-space: pre-wrap;
  color: inherit;
}
</style>
