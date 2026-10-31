export function useMapStyle() {
  const colorMode = useColorMode();

  return computed(() =>
    colorMode.value === "light"
      ? "https://tiles.openfreemap.org/styles/liberty"
      : "https://tiles.openfreemap.org/styles/dark",
  );
}
