<template lang="pug">
.row
  .col
    h3 METAR:
    template(v-if="pending && !metar")
      b-alert(variant="primary", :model-value="true")
        .hstack.gap-2.align-items-center
          b-spinner
          div Loading data
    template(v-if="!pending && !metar")
      b-alert(v-if="notFound", variant="danger", :model-value="true") METAR not found
      b-alert(v-else, variant="danger", :model-value="true")
        .hstack.gap-2.align-items-center.justify-content-between
          div Couldn't load the METAR
          b-button(size="sm", variant="danger", @click="refresh()") Retry
    template(v-if="metar")
      .row
        .col
          b-alert(variant="primary", :model-value="true")
            .hstack.gap-2.align-items-center
              flight-category-badge(:category="metar.flight_category")
              .font-monospace {{ metar.raw_text }}
          b-alert(v-if="isStale", variant="warning", :model-value="true") This METAR is more than an hour old. The station may have stopped reporting.
      .row
        .col
          h3 Parsed METAR:
          p.text-muted Observed {{ dayjs.utc(metar.observed).format("dddd DD MMM YYYY [at] HH:mm [Z]") }} #[span.observed-relative ({{ observedRelative }})]
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
  MetarDerived,
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

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const STALE_AFTER_MINUTES = 60;

const {
  data: metar,
  error,
  pending,
  refresh,
} = useLazyFetch<IMetar>(() => `/api/airport/${props.icao}/metar`);

useIntervalFn(refresh, REFRESH_INTERVAL_MS);

const notFound = computed(() => isClientError(error.value?.statusCode));

const now = useNow({ interval: 60 * 1000 });

const observedRelative = computed(() =>
  metar.value ? dayjs(metar.value.observed).from(now.value) : ""
);

const isStale = computed(
  () =>
    !!metar.value &&
    dayjs(now.value).diff(metar.value.observed, "minute") > STALE_AFTER_MINUTES
);

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
      component: MetarDerived,
      props: {
        ...commonProps,
        airportInfo: props.airportInfo,
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
