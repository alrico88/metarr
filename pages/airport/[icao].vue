<template lang="pug">
.container
  .row
    .col
      b-overlay(:show="pending")
        b-alert(:model-value="!airportData", variant="danger") Airport not found
        l-map.border.rounded(
          v-if="airportData",
          :center="center",
          :zoom="zoom",
          :style="{ height: '600px' }",
          @ready="isReady = true"
        )
          l-tile-layer(:url="tileUrl", :attribution="tileAttribution")
          l-marker(
            v-if="airportData",
            :lat-lng="[airportData.latitude, airportData.longitude]"
          )
            l-tooltip(:content="airportData.icao")
          l-control(
            position="topright",
            v-if="airportData",
            :style="{ maxWidth: '400px' }",
            disable-scroll-propagation,
            disable-click-propagation
          )
            b-card(header="Airport info")
              scroller-elem(:height="300")
                .vstack.gap-2
                  b-list-group
                    airport-info-row(title="ICAO", :value="airportData.icao")
                    airport-info-row(
                      title="Airport name",
                      :value="airportData.name"
                    )
                    airport-info-row(
                      title="Municipality",
                      :value="airportData.municipality"
                    )
                    airport-info-row(
                      title="Elevation",
                      :value="`${airportData.elevation} feet`"
                    )
                    airport-info-row(
                      title="Runways",
                      :value="airportData.runwayCount"
                    )
                  .fw-bold Runways
                  b-list-group
                    airport-info-row(
                      v-for="rwy of airportData.runways",
                      :key="rwy.ident",
                      :title="rwy.ident",
                      :value="`${rwy.bearing}º`"
                    )
</template>

<script setup lang="ts">
import is from "@sindresorhus/is";

const route = useRoute();
const icao = computed(() => route.params.icao as string);

const { data: airportData, pending } = await useFetch<Airport>(
  `/api/airport/${icao.value}/data`
);

useSeoMeta({
  title: () => `${icao.value} - ${airportData.value?.name ?? ""} Data`,
});

const { tileUrl, tileAttribution } = useTile();

const center = ref<[number, number]>([0, 0]);
const zoom = ref(3);

const isReady = ref(false);

watch(
  [airportData, isReady],
  ([val]) => {
    if (is.nullOrUndefined(val) || !isReady) {
      return;
    }

    center.value = [val.latitude, val.longitude];
    zoom.value = 10;
  },
  {
    immediate: true,
  }
);
</script>
