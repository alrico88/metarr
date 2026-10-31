const MAX_RECENTS = 8;

export function useSavedAirports() {
  const favorites = useLocalStorage<string[]>("metarr-favorites", []);
  const recents = useLocalStorage<string[]>("metarr-recents", []);

  function isFavorite(icao: string): boolean {
    return favorites.value.includes(icao);
  }

  function toggleFavorite(icao: string): void {
    favorites.value = isFavorite(icao)
      ? favorites.value.filter((d) => d !== icao)
      : [...favorites.value, icao].sort();
  }

  function addRecent(icao: string): void {
    recents.value = [icao, ...recents.value.filter((d) => d !== icao)].slice(
      0,
      MAX_RECENTS
    );
  }

  return {
    favorites: readonly(favorites),
    recents: readonly(recents),
    isFavorite,
    toggleFavorite,
    addRecent,
  };
}
