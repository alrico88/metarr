<template lang="pug">
form(@submit.prevent="goToMetar")
  u-field-group.w-full
    u-input-menu.flex-1(
      v-model="selected",
      v-model:search-term="icao",
      :items="filteredSuggestions",
      :size="size",
      ignore-filter,
      placeholder="Search ICAO. Ex: KJFK",
      autocomplete="off",
      :ui="{ trailing: 'hidden' }",
      @update:model-value="onSelect"
    )
    u-button(
      type="submit",
      icon="bi:search",
      :label="compact ? undefined : 'Search'",
      aria-label="Search",
      :size="size",
      :disabled="goToDisabled"
    )
</template>

<script setup lang="ts">
import is from "@sindresorhus/is";
import { orderBy } from "es-toolkit";

const props = defineProps<{
  compact?: boolean;
}>();

const size = computed(() => (props.compact ? "sm" : "lg"));

const { data: icaos } = useFetch("/api/airport/autocomplete");
const icaosList = computed(() => icaos.value || ([] as string[]));

const route = useRoute();

const icao = upperRef("");

watch(
  () => route.params.icao,
  (val) => {
    if (is.falsy(val)) {
      return;
    }

    icao.value = val as string;
  },
  {
    immediate: true,
  },
);

const MAX_SUGGESTIONS = 50;

const selected = ref<string>();

const filteredSuggestions = computed(() => {
  const query = icao.value.trim();

  if (query === "") {
    return [];
  }

  return orderBy(
    icaosList.value.filter(d => d.includes(query)),
    [d => d.startsWith(query)],
    ["desc"],
  ).slice(0, MAX_SUGGESTIONS);
});

function goToMetar() {
  navigateTo(`/metar/${icao.value.trim()}`);
}

function onSelect(value?: string) {
  if (!value) {
    return;
  }

  icao.value = value;
  goToMetar();
}

const goToDisabled = computed(() => is.emptyStringOrWhitespace(icao.value));
</script>
