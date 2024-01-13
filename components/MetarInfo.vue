<template lang="pug">
.row
  .col
    h3 METAR:
    template(v-if="pending")
      b-alert(variant="primary", :model-value="true")
        .hstack.gap-2.align-items-center
          b-spinner
          div Loading data
    template(v-if="!pending && (!metar || error)")
      b-alert(variant="danger", :model-value="true") METAR not found
    template(v-if="!pending && metar")
      .row
        .col
          b-alert.font-monospace(variant="primary", :model-value="true") {{ metar.raw_text }}
      .row
        .col
          h3 Parsed METAR:
          p.text-muted Observed {{ dayjs.utc(metar.observed).format("dddd DD MMM YYYY [at] HH:mm [Z]") }} #[span.observed-relative ({{ dayjs(metar.observed).fromNow() }})]
          masonry-wall(
            :items="items",
            :ssr-columns="3",
            :column-width="350",
            :gap="16"
          )
            template(#default="{ item }")
              component(:is="item.component", v-bind="item.props")
</template>

<script setup lang="ts">
import {
  MetarAltimeter,
  MetarClouds,
  MetarConditions,
  MetarPhenomena,
  MetarVisibility,
  MetarWind,
} from "#components";
import MasonryWall from "@yeger/vue-masonry-wall";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(utc);
dayjs.extend(relativeTime);

const props = defineProps<{
  icao: string;
  airportInfo: Airport | null;
}>();

const {
  data: metar,
  error,
  pending,
} = useLazyFetch<IMetar>(`/api/airport/${props.icao}/metar`);

const items = computed(() => {
  const commonProps = {
    metar: metar.value as IMetar,
  };

  return [
    {
      component: MetarConditions,
      props: {
        ...commonProps,
      },
    },
    {
      component: MetarWind,
      props: {
        ...commonProps,
        airportInfo: props.airportInfo,
      },
    },
    {
      component: MetarAltimeter,
      props: {
        ...commonProps,
      },
    },
    {
      component: MetarVisibility,
      props: {
        ...commonProps,
      },
    },
    {
      component: MetarClouds,
      props: {
        ...commonProps,
      },
    },
    {
      component: MetarPhenomena,
      props: {
        ...commonProps,
      },
    },
  ];
});
</script>

<style lang="scss" scoped>
.observed-relative {
  color: #5289f5;
}
</style>
