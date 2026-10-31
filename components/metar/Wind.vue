<script setup lang="ts">
import is from "@sindresorhus/is";
import { maxBy } from "es-toolkit";
import { processNumber } from "number-helper-functions";
import type { FieldDef } from "../DataTable.vue";

const props = defineProps<{
  metar: IMetar;
  airportInfo: Airport | null;
}>();

const windUnits = shallowRef<"kts" | "mps">("kts");

const windUnitsOpts = [
  {
    text: "m/s",
    value: "mps",
  },
  {
    text: "Knots",
    value: "kts",
  },
];

const windSpeed = computed(() =>
  processNumber(props.metar.wind[`speed_${windUnits.value}`]),
);
const gustsSpeed = computed(() =>
  processNumber(props.metar.wind[`gust_${windUnits.value}`]),
);
const windUnitsText = computed(
  () => windUnitsOpts.find(d => d.value === windUnits.value)?.text,
);
const windFrom = computed(() =>
  is.nullOrUndefined(props.metar.wind.degrees)
    ? "VRB"
    : `${props.metar.wind.degrees}º`,
);

function feetToMeters(feet: number): number {
  return feet / 3.281;
}

const { getAzimuth } = useGeography();

const fields: FieldDef[] = [
  {
    label: "Rwy.",
    key: "ident",
    sortable: true,
  },
  {
    label: "Surface",
    key: "surface",
    sortable: true,
  },
  {
    label: "Length",
    key: "lengthInKm",
    sortable: true,
    formatter: d => `${d} km.`,
  },
  {
    label: "Width",
    key: "widthInM",
    sortable: true,
    formatter: d => `${d} m.`,
  },
  {
    label: "Wind",
    key: "windDirection",
    sortable: true,
  },
  {
    label: "Head/tail",
    key: "headwind",
    sortable: true,
  },
  {
    label: "Cross",
    key: "crosswind",
    sortable: true,
  },
];

const hasDirectionalWind = computed(
  () =>
    !is.nullOrUndefined(props.metar.wind.degrees)
    && props.metar.wind.speed_kts > 0,
);

function reciprocalIdent(ident: string): string {
  const match = /^(\d{1,2})([A-Z]?)$/.exec(ident);

  if (!match) {
    return ident;
  }

  const heading = ((Number(match[1]) + 17) % 36) + 1;
  const side = ({ L: "R", R: "L" } as Record<string, string>)[match[2]!] ?? match[2];

  return `${String(heading).padStart(2, "0")}${side}`;
}

// Both ends of a physical runway share a row.
const runwayStrips = computed(() => {
  const remaining = [...(props.airportInfo?.runways ?? [])];
  const strips: Runway[][] = [];

  while (remaining.length) {
    const first = remaining.shift()!;
    const opposite = reciprocalIdent(first.ident);
    const index = remaining.findIndex(d => d.ident === opposite);

    strips.push(
      index === -1 ? [first] : [first, ...remaining.splice(index, 1)],
    );
  }

  return strips;
});

const runwayInfo = computed(() => {
  const { degrees } = props.metar.wind;
  const speed = props.metar.wind[`speed_${windUnits.value}`];

  return runwayStrips.value.map((strip) => {
    const ends = strip.map(end => ({
      ...end,
      components: hasDirectionalWind.value
        ? runwayWindComponents(degrees, speed, end.bearing)
        : null,
    }));

    // The end with the most headwind is the one worth using.
    const best = hasDirectionalWind.value
      ? maxBy(ends, d => d.components!.headwind)!
      : ends[0]!;
    const { components } = best;

    return {
      ident: ends.map(d => d.ident).join(" / "),
      bestEnd: best.ident,
      surface: best.surface,
      lengthInKm: processNumber(feetToMeters(best.length) / 1000, 1),
      widthInM: processNumber(feetToMeters(best.width), 1),
      windDirection: components ? getAzimuth(degrees - best.bearing) - 180 : null,
      headwind: components ? processNumber(components.headwind, 1) : null,
      crosswind: components ? processNumber(components.crosswind, 1) : null,
    };
  });
});

const favoredEnd = computed(
  () =>
    maxBy(
      runwayInfo.value.filter(d => d.headwind !== null),
      d => d.headwind as number,
    )?.bestEnd,
);

function formatHeadwind(value: unknown): string {
  if (!is.number(value)) {
    return "–";
  }

  return value >= 0 ? `H ${value}` : `T ${Math.abs(value)}`;
}

function formatCrosswind(value: unknown): string {
  if (!is.number(value)) {
    return "–";
  }

  if (value === 0) {
    return "0";
  }

  return value > 0 ? `${value} R` : `${Math.abs(value)} L`;
}

function asNumber(d: unknown): number {
  return d as number;
}
</script>

<template lang="pug">
u-card
  template(#header)
    .flex.items-center.justify-between.gap-2
      div #[icon(name="bi:wind")] Wind
      simple-chooser(:options="windUnitsOpts", v-model="windUnits")
  .grid.grid-cols-3.gap-4.p-4
    div
      h5.mb-1.text-lg.font-bold Speed:
      .font-mono {{ windSpeed }} {{ windUnitsText }}
    div
      h5.mb-1.text-lg.font-bold Gusting to:
      .font-mono {{ gustsSpeed }} {{ windUnitsText }}
    div
      h5.mb-1.text-lg.font-bold From:
      .font-mono {{ windFrom }}
  data-table(
    :fields="fields",
    :items="runwayInfo",
    sort-column="ident",
    empty-text="No runway data"
  )
    template(#cell(ident)="{ value, item }")
      .flex.items-center.gap-2
        div {{ value }}
        u-badge(v-if="hasDirectionalWind && item.bestEnd === favoredEnd", color="success", variant="subtle", :label="`Favored: ${item.bestEnd}`")
    template(#cell(windDirection)="{ value }")
      div(v-if="value !== null")
        heading-arrow(:azimuth="asNumber(value)")
      div(v-else) –
    template(#cell(headwind)="{ value }")
      .font-mono.whitespace-nowrap {{ formatHeadwind(value) }}
    template(#cell(crosswind)="{ value }")
      .font-mono.whitespace-nowrap {{ formatCrosswind(value) }}
</template>
