<template lang="pug">
.flex.min-h-screen.flex-col
  u-header(to="/")
    template(#title)
      img(src="/logo.png", width="43", height="30", alt="")
      span.text-xl.font-bold metarr
    template(#right)
      u-navigation-menu.hidden(:items="links", class="md:flex")
      airport-search.hidden.w-72(v-if="!isHome", compact, class="md:block")
      u-color-mode-button
    template(#body)
      airport-search.mb-4(v-if="!isHome", compact)
      u-navigation-menu(:items="links", orientation="vertical", class="-mx-2.5")
  main.flex-1.py-6
    slot
  the-footer
</template>

<script setup lang="ts">
const route = useRoute();

const isHome = computed(() => route.path === "/");

const links = computed(() => [
  {
    label: "Nearest stations",
    icon: "gis:gnss-antenna",
    to: "/nearest",
    active: route.path === "/nearest",
  },
  {
    label: "Stations map",
    icon: "bi:map",
    to: "/map",
    active: route.path === "/map",
  },
]);
</script>
