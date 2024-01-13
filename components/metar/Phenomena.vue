<template lang="pug">
b-card(no-body)
  template(#header) #[icon(name="bi:cloud-rain")] Weather phenomena
  b-card-body.p-0
    data-table.mb-0(
      :fields="fields",
      :items="metar.conditions",
      bordered,
      sort-column="code",
      empty-text="No phenomena"
    )
</template>
ß
<script setup lang="ts">
import { get } from "lodash-es";
import type { FieldDef } from "../DataTable.vue";

const props = defineProps<{
  metar: IMetar;
}>();

function phenomenaFormatter(ph: string): string {
  /**
   * Sourced from `python-metar-taf-parser`
   * @link https://github.com/mivek/python-metar-taf-parser
   */
  const translationKeys = {
    RA: "Rain",
    DZ: "Drizzle",
    SN: "Snow",
    SG: "Snow Grains",
    PL: "Ice Pellets",
    IC: "Ice Crystals",
    GR: "Hail",
    GS: "Small Hail",
    UP: "Unknow Precipitation",
    FG: "Fog",
    VA: "Volcanic Ash",
    BR: "Mist",
    HZ: "Haze",
    DU: "Widespread Dust",
    FU: "Smoke",
    SA: "Sand",
    PY: "Spray",
    SQ: "Squall",
    PO: "Sand Whirls",
    DS: "Duststorm",
    SS: "Sandstorm",
    FC: "Funnel Cloud",
    FZ: "Freezing",
    SH: "Showers",
    MI: "Shallow",
    BC: "Patches",
    PR: "Partial",
    DR: "Drifting",
    TS: "Thunderstorm",
    BL: "Blowing",
  };

  return get(translationKeys, ph, ph);
}

const fields: FieldDef[] = [
  {
    label: "Phenomena",
    key: "code",
    sortable: true,
    formatter: (d) => phenomenaFormatter(d as string),
  },
];
</script>
