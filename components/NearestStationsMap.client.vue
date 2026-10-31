<script setup lang="ts">
import { MglMap, MglNavigationControl } from "@indoorequal/vue-maplibre-gl";
import type { LngLatBoundsLike } from "maplibre-gl";

const props = defineProps<{
  position: Pick<GeolocationCoordinates, "latitude" | "longitude">;
  stations: NearestAirport[];
}>();

const emit = defineEmits<{
  select: [station: NearestAirport];
}>();

const mapStyle = useMapStyle();
const center = computed<[number, number]>(() => [
  props.position.longitude,
  props.position.latitude,
]);
const bounds = computed<LngLatBoundsLike | undefined>(() => {
  if (!props.stations.length) return undefined;

  const longitudes = [props.position.longitude];
  const latitudes = [props.position.latitude];
  for (const { station } of props.stations) {
    longitudes.push(station.longitude);
    latitudes.push(station.latitude);
  }

  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
});

const markers = computed(() =>
  props.stations.map((item) => ({
    item,
    color: flightCategoryColor(item.flight_category),
  }))
);
</script>

<template lang="pug">
.border.rounded.overflow-hidden(style="height: 300px")
  mgl-map(
    :map-style="mapStyle",
    :center="center",
    :zoom="4",
    :bounds="bounds",
    :fit-bounds-options="{ padding: 50, maxZoom: 12, duration: 0 }"
  )
    mgl-navigation-control(position="top-left")
    map-marker(:coordinates="center", label="Your position", anchor="center")
      img(src="/crosshair.png", width="30", height="30", alt="")
    map-marker(
      v-for="{ item, color } of markers",
      :key="item.station.icao",
      :coordinates="[item.station.longitude, item.station.latitude]",
      :label="item.station.icao",
      :color="color",
      :action-label="`Check METAR for ${item.station.icao}`",
      @select="emit('select', item)"
    )
</template>
