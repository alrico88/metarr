<script setup lang="ts">
const props = defineProps<{
  icao: string;
}>();

const { data: atis } = useLazyFetch<Atis[]>(
  () => `/api/airport/${props.icao}/atis`,
);

const TYPE_LABELS: Record<Atis["type"], string> = {
  combined: "ATIS",
  arr: "Arrival ATIS",
  dep: "Departure ATIS",
};

const entries = computed(() =>
  (atis.value ?? []).map(d => ({
    ...d,
    title: `${TYPE_LABELS[d.type] ?? "ATIS"} · Info ${d.code} · ${d.time}Z`,
  })),
);
</script>

<template lang="pug">
div(v-if="entries.length")
  h3.text-2xl.font-medium.mb-2 ATIS:
  .flex.flex-col.gap-2
    u-alert(
      v-for="entry of entries",
      :key="entry.type",
      color="primary",
      variant="subtle"
    )
      template(#title)
        span.font-bold {{ entry.title }}
      template(#description)
        span.font-mono {{ entry.datis }}
  p.text-sm.text-muted.mt-2 FAA D-ATIS via #[a.text-primary.hover-underline(href="https://atis.info", target="_blank", rel="noopener") atis.info] (unofficial). Not for operational use.
</template>
