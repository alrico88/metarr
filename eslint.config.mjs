// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "vue/multi-word-component-names": "off",
    "arrow-body-style": "error",
    "@typescript-eslint/no-explicit-any": "off",
  },
});
