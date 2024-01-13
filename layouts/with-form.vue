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
              b-input-group
                b-form-input(v-model="icao", placeholder="Ex: KJFK")
                b-button(type="submit", variant="primary") #[icon(name="bi:search")] Search
        .col
          b-form-group.fw-bold(label="Search nearest:")
            b-button.w-100(to="/nearest", variant="primary") #[icon(name="gis:gnss-antenna")] Find nearest stations
    main
      slot
  the-footer
</template>

<script setup lang="ts">
import is from "@sindresorhus/is";

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

function goToMetar() {
  navigateTo(`/metar/${icao.value}`);
}
</script>
