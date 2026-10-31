<template lang="pug">
u-table(
  v-model:sorting="sorting",
  :data="items",
  :columns="columns",
  :loading="busy",
  :ui="ui"
)
  template(v-for="field of fields", :key="field.key", #[`${field.key}-cell`]="{ row }")
    slot(
      :name="`cell(${field.key})`",
      :value="get(row.original, field.key)",
      :item="row.original"
    ) {{ getRowValue(row.original, field) }}
  template(#empty) {{ emptyText }}
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { SortingState } from "@tanstack/vue-table";
import is from "@sindresorhus/is";
import { get } from "es-toolkit/compat";

export interface FieldDef {
  key: string;
  label: string;
  formatter?: (d: unknown) => string;
  sortable?: boolean;
}

const props = withDefaults(
  defineProps<{
    bordered?: boolean;
    striped?: boolean;
    items?: Record<string, unknown>[];
    fields: FieldDef[];
    emptyText?: string;
    busy?: boolean;
  }>(),
  {
    items: () => [],
    emptyText: "No items",
    busy: false,
  },
);
const sortColumn = defineModel<string>("sortColumn", {
  required: false,
  default: "",
});
const sortOrder = defineModel<"asc" | "desc">("sortOrder", {
  required: false,
  default: "asc",
});

const UButton = resolveComponent("UButton");

const ui = computed(() => {
  const divider = props.bordered ? "border-e border-default last:border-e-0" : "";

  return {
    root: props.bordered ? "rounded-lg border border-default bg-default" : "",
    tr: props.striped ? "even:bg-elevated/70" : "",
    th: `py-1 ${divider}`,
    td: divider,
  };
});

const sorting = computed<SortingState>({
  get: () =>
    sortColumn.value
      ? [{ id: sortColumn.value, desc: sortOrder.value === "desc" }]
      : [],
  set: (val) => {
    const [first] = val;

    sortColumn.value = first?.id ?? "";
    sortOrder.value = first?.desc ? "desc" : "asc";
  },
});

watch(
  () => props.fields,
  (val) => {
    sortColumn.value = val[0]!.key;
  },
);

function getRowValue(item: Record<string, unknown>, fieldDef: FieldDef): any {
  return is.function(fieldDef.formatter)
    ? fieldDef.formatter(get(item, fieldDef.key))
    : get(item, fieldDef.key);
}

function sortIcon(sorted: false | "asc" | "desc"): string {
  if (sorted === "asc") {
    return "i-lucide-arrow-up-narrow-wide";
  }

  return sorted === "desc"
    ? "i-lucide-arrow-down-wide-narrow"
    : "i-lucide-arrow-up-down";
}

const columns = computed<TableColumn<Record<string, unknown>>[]>(() =>
  props.fields.map(field => ({
    id: field.key,
    accessorFn: row => get(row, field.key),
    enableSorting: field.sortable === true,
    header: ({ column }) =>
      field.sortable
        ? h(UButton, {
            color: "neutral",
            variant: "ghost",
            label: field.label,
            icon: sortIcon(column.getIsSorted()),
            class: "-mx-2.5 font-semibold",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          })
        : field.label,
    cell: ({ row }) => getRowValue(row.original, field),
  })),
);
</script>
