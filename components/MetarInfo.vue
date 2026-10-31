<template lang="pug">
div
  h3.text-2xl.font-medium.mb-2 METAR:
  template(v-if="pending && !metar")
    u-alert(color="primary", variant="subtle", title="Loading data", icon="i-lucide-loader-circle", :ui="{ leadingIcon: 'animate-spin' }")
  template(v-else-if="!metar")
    u-alert(v-if="notFound", color="error", variant="subtle", title="METAR not found")
    u-alert(
      v-else,
      color="error",
      variant="subtle",
      title="Couldn't load the METAR",
      :actions="[{ label: 'Retry', color: 'error', onClick: () => refresh() }]"
    )
  template(v-else)
    .flex.flex-col.gap-3
      u-alert(color="primary", variant="subtle")
        template(#title)
          .flex.items-center.gap-2
            flight-category-badge(:category="metar.flight_category")
            .font-mono {{ metar.raw_text }}
      u-alert(
        v-if="isStale",
        color="warning",
        variant="subtle",
        title="This METAR is more than 90 minutes old. The station may have stopped reporting."
      )
    h3.text-2xl.font-medium.mt-4.mb-2 Parsed METAR:
    p.text-muted.mb-3 Observed {{ dayjs.utc(metar.observed).format("dddd DD MMM YYYY [at] HH:mm [Z]") }} #[span.observed-relative ({{ observedRelative }})]
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
import { MasonryWall } from "@yeger/vue-masonry-wall";
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
// Hourly reports reach the feed a few minutes late, so an hour is normal.
const STALE_AFTER_MINUTES = 90;

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
  metar.value ? dayjs(metar.value.observed).from(now.value) : "",
);

const isStale = computed(
  () =>
    !!metar.value
    && dayjs(now.value).diff(metar.value.observed, "minute") > STALE_AFTER_MINUTES,
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

<style scoped>
.observed-relative {
  color: #5289f5;
}
</style>
