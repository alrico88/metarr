<template lang="pug">
b-card(no-body)
  template(#header) #[icon(name="bi:cloudy")] Clouds
  b-card-body.p-0
    data-table.mb-0(
      :fields="fields",
      :items="metar.clouds",
      bordered,
      empty-text="No clouds",
      sort-column="base_feet_agl",
      sort-order="desc"
    )
</template>
ß
<script setup lang="ts">
import { get } from "lodash-es";
import type { FieldDef } from "../DataTable.vue";

const props = defineProps<{
  metar: IMetar;
}>();

function cloudFormatter(condition: string): string {
  /**
   * Sourced from `python-metar-taf-parser`
   * @link https://github.com/mivek/python-metar-taf-parser
   */
  const conditionTranslations = {
    SKC: "Sky clear",
    FEW: "Few",
    BKN: "Broken",
    SCT: "Scattered",
    OVC: "Overcast",
    NSC: "No significant cloud",
  };

  return get(conditionTranslations, condition, condition);
}

const fields: FieldDef[] = [
  {
    label: "Condition",
    key: "code",
    sortable: true,
    formatter: (d) => cloudFormatter(d as string),
  },
  {
    label: "Elevation (feet)",
    key: "base_feet_agl",
    sortable: true,
  },
];
</script>
