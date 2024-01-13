<template lang="pug">
footer.mt-auto.p-3.border-top
  .col
    .hstack.gap-2.flex-wrap.align-items-center
      .flex-grow-1
        ul.list-unstyled.list-inline.mb-2
          li.list-inline-item #[icon(name="tabler:user")] Made by #[nuxt-link(:to="portfolioLink", v-bind="linkOpts") Alberto Rico]
          li.list-inline-item #[icon(name="tabler:code")] Code on #[nuxt-link(:to="repoLink", v-bind="linkOpts") Github]
        div #[icon(name="tabler:coffee")] Found it useful? #[nuxt-link(:to="supportLink", v-bind="linkOpts") Support me]
      div
        .mb-2 #[icon(name="material-symbols:data-table-outline")] Weather data sourced from #[nuxt-link(:to="dataLink", v-bind="linkOpts") aviationweather.gov]
        color-mode
</template>

<script setup lang="ts">
const portfolioLink = "https://www.alrico.es";
const repoLink = "https://github.com/alrico88/metarr";
const supportLink = "https://www.buymeacoffee.com/albertorico";
const dataLink = "https://aviationweather.gov/";

const linkOpts = {
  target: "_blank",
};
</script>
