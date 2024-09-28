<template lang="pug">
.d-flex.flex-column.h-100
  .py-4.flex-shrink-0
    header.container.mb-4
      .row.mb-3
        .col
          nuxt-link.text-decoration-none.d-inline-block(to="/")
            h1.fw-bold.mb-0 #[img(src="/logo.png", width="43", height="30")] metarr
      .row.g-3
        .col-12.col-md-9
          b-form(@submit.prevent="goToMetar")
            b-form-group.fw-bold(label="Search airport by ICAO:")
              .position-relative.w
                b-input-group
                  b-form-input(
                    v-model="icao",
                    ref="inputRef",
                    placeholder="Ex: KJFK",
                    @keydown.down.prevent="navigateList('down')",
                    @keydown.up.prevent="navigateList('up')",
                    autocomplete="off"
                  )
                  b-button(
                    type="submit",
                    variant="primary",
                    :disabled="goToDisabled"
                  ) #[icon(name="bi:search")] Search
                autocomplete(
                  :suggestions="filteredSuggestions",
                  v-model:suggestion-index="suggestionIndex",
                  :show="showAutocomplete",
                  @suggestion-clicked="goToMetar"
                )
        .col
          b-form-group.fw-bold(label="Search nearest:")
            b-button.w-100(to="/nearest", variant="primary") #[icon(name="gis:gnss-antenna")] Find nearest stations
    main
      slot
  the-footer
</template>

<script setup lang="ts">
import is from "@sindresorhus/is";

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
  }
);

const {
  suggestionIndex,
  filteredSuggestions,
  navigateList,
  showAutocomplete,
  inputRef,
} = useAutocomplete(icao, icaosList);

function goToMetar() {
  if (suggestionIndex.value !== -1) {
    icao.value = filteredSuggestions.value[suggestionIndex.value];
  }

  navigateTo(`/metar/${icao.value}`);

  nextTick(() => {
    showAutocomplete.value = false;
  });
}

const goToDisabled = computed(() => is.emptyStringOrWhitespace(icao.value));
</script>
