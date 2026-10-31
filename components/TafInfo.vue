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
  () => !!error.value && !isClientError(error.value.statusCode)
);
</script>

<template lang="pug">
.row
  .col
    h3 TAF:
    b-alert(v-if="pending && !taf", variant="primary", :model-value="true")
      .hstack.gap-2.align-items-center
        b-spinner
        div Loading data
    b-alert(v-else-if="failed", variant="danger", :model-value="true")
      .hstack.gap-2.align-items-center.justify-content-between
        div Couldn't load the TAF
        b-button(size="sm", variant="danger", @click="refresh()") Retry
    b-alert(v-else-if="!taf", variant="secondary", :model-value="true") No TAF available for this station
    b-alert(v-else, variant="primary", :model-value="true")
      pre.font-monospace.mb-0.taf {{ taf.raw }}
</template>

<style lang="scss" scoped>
.taf {
  white-space: pre-wrap;
  color: inherit;
}
</style>
