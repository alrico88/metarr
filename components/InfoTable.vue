<template lang="pug">
u-table(
  :data="rows",
  :columns="columns",
  :ui="{ thead: 'hidden', base: 'w-full', td: 'py-1.5 whitespace-nowrap last:w-full last:min-w-20 last:max-w-0 last:truncate last:text-right' }"
)
  template(#title-cell="{ row }")
    slot(name="title", :row="row.original")
      span.font-bold {{ row.original.title }}
  template(#value-cell="{ row }")
    slot(name="value", :row="row.original")
      span.block.truncate.font-mono(
        :style="row.original.color ? { color: row.original.color } : undefined",
        :title="String(row.original.value)"
      ) {{ row.original.value }}
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

export interface InfoRow {
  title: string;
  value: string | number;
  color?: string;
}

defineProps<{
  rows: InfoRow[];
}>();

const columns: TableColumn<InfoRow>[] = [
  { accessorKey: "title" },
  { accessorKey: "value" },
];
</script>
