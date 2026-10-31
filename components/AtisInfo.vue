<script setup lang="ts">
const props = defineProps<{
  icao: string;
}>();

const { data: atis } = useLazyFetch<Atis[]>(
  () => `/api/airport/${props.icao}/atis`
);

const TYPE_LABELS: Record<Atis["type"], string> = {
  combined: "ATIS",
  arr: "Arrival ATIS",
  dep: "Departure ATIS",
};

const entries = computed(() =>
  (atis.value ?? []).map((d) => ({
    ...d,
    title: `${TYPE_LABELS[d.type] ?? "ATIS"} · Info ${d.code} · ${d.time}Z`,
  }))
);
</script>

<template lang="pug">
.row(v-if="entries.length")
  .col
    h3 ATIS:
    .vstack.gap-2
      b-alert(
        v-for="entry of entries",
        :key="entry.type",
        variant="primary",
        :model-value="true"
      )
        .fw-bold.mb-1 {{ entry.title }}
        .font-monospace {{ entry.datis }}
    p.text-muted.small.mb-0 FAA D-ATIS via #[a(href="https://atis.info", target="_blank", rel="noopener") atis.info] (unofficial). Not for operational use.
</template>
