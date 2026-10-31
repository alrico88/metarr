<template lang="pug">
footer.mt-auto.border-t.border-default.p-3
  u-container
    .flex.flex-wrap.items-center.gap-2.text-sm
      .grow
        .mb-2.flex.flex-wrap.gap-x-4
          div #[icon(name="tabler:user")] Made by #[nuxt-link.text-primary.hover-underline(:to="portfolioLink", v-bind="linkOpts") Alberto Rico]
          div #[icon(name="tabler:code")] Code on #[nuxt-link.text-primary.hover-underline(:to="repoLink", v-bind="linkOpts") Github]
        div #[icon(name="tabler:coffee")] Found it useful? #[nuxt-link.text-primary.hover-underline(:to="supportLink", v-bind="linkOpts") Support me]
      div #[icon(name="material-symbols:data-table-outline")] Weather data sourced from #[nuxt-link.text-primary.hover-underline(:to="dataLink", v-bind="linkOpts") aviationweather.gov]
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
