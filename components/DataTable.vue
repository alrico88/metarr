<template lang="pug">
b-overlay(:show="busy")
  .table-responsive.mb-0
    table.table.align-middle(:class="classes")
      thead(:class="theadClass")
        tr
          th(
            v-for="field of fields",
            :key="field.key",
            :class="{ 'cursor-pointer': field.sortable === true }",
            @click="handleColumnClick(field)"
          )
            .hstack.gap-1.align-items-center
              icon(
                v-if="field.sortable",
                :name="getIconName(field)",
                :style="{ opacity: field.key !== sortColumn ? 0.2 : 1 }"
              )
              div {{ field.label }}
      tbody
        tr(v-if="sortedItems.length === 0")
          td(:colspan="fields.length") {{ emptyText }}
        tr(v-for="row, index of sortedItems", :key="row._id")
          td(v-for="field of fields", :key="field.key")
            slot(
              :name="$slots[`cell(${String(field.key)})`] ? `cell(${String(field.key)})` : 'cell()'",
              :value="get(row, field.key)",
              :index="index",
              :item="row"
            ) {{ getRowValue(row, field) }}
</template>

<script setup lang="ts">
import is from "@sindresorhus/is";
import { get, orderBy } from "lodash-es";
import { nanoid } from "nanoid";

export interface FieldDef {
  key: string;
  label: string;
  formatter?: (d: unknown) => string;
  sortable?: boolean;
}

const props = withDefaults(
  defineProps<{
    bordered?: boolean;
    borderless?: boolean;
    items?: Record<string, unknown>[];
    fields: FieldDef[];
    emptyText?: string;
    busy?: boolean;
  }>(),
  {
    items: () => [],
    fields: () => [],
    emptyText: "No items",
    busy: false,
  }
);
const sortColumn = defineModel<string>("sortColumn", {
  required: false,
  default: "",
});
const sortOrder = defineModel<"asc" | "desc">("sortOrder", {
  required: false,
  default: "asc",
});

const colorMode = useColorMode();
const theadClass = computed(() => `table-${colorMode.value}`);

const classes = computed(() => ({
  "table-bordered": props.bordered,
  "table-borderless": props.borderless,
}));

watch(
  () => props.fields,
  (val) => {
    sortColumn.value = val[0].key;
  }
);

function handleColumnClick(field: FieldDef) {
  if (!field.sortable) {
    return;
  }

  if (sortColumn.value === field.key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = field.key;
    sortOrder.value = "asc";
  }
}

interface ItemWithId extends Record<string, unknown> {
  _id: string;
}

const itemsWithIds = computed<ItemWithId[]>(() =>
  props.items.map((d) => ({
    ...d,
    _id: nanoid(),
  }))
);

const sortedItems = computed(() =>
  orderBy(itemsWithIds.value, sortColumn.value, sortOrder.value)
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRowValue(item: Record<string, unknown>, fieldDef: FieldDef): any {
  return is.function(fieldDef.formatter)
    ? fieldDef.formatter(get(item, fieldDef.key))
    : get(item, fieldDef.key);
}

function getIconName(field: FieldDef): string {
  if (field.key === sortColumn.value) {
    return sortOrder.value === "asc"
      ? "ph:sort-ascending-bold"
      : "ph:sort-descending-bold";
  } else {
    return "solar:sort-vertical-broken";
  }
}
</script>
