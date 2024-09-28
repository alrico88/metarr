import is from "@sindresorhus/is";

export function useAutocomplete(
  query: Ref<string>,
  suggestions: Ref<string[]>
) {
  const inputRef = templateRef("inputRef");

  const filteredSuggestions = computed(() => {
    if (query.value === "") {
      return [];
    }

    return suggestions.value.filter((d) =>
      d.toLowerCase().includes(query.value.toLowerCase())
    );
  });

  const showAutocomplete = ref(false);

  onClickOutside(inputRef, () => {
    showAutocomplete.value = false;
  });

  const suggestionIndex = ref(-1);

  watch(query, (val) => {
    suggestionIndex.value = -1;

    showAutocomplete.value = is.nonEmptyStringAndNotWhitespace(val);
  });

  function scrollActiveItemIntoView() {
    nextTick(() => {
      const activeItem = document.querySelector(".list-group-item.active");

      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }

  function navigateList(direction: "up" | "down"): void {
    if (direction === "down") {
      suggestionIndex.value =
        (suggestionIndex.value + 1) % filteredSuggestions.value.length;
    } else {
      suggestionIndex.value =
        (suggestionIndex.value - 1 + filteredSuggestions.value.length) %
        filteredSuggestions.value.length;
    }
    scrollActiveItemIntoView();
  }

  return {
    inputRef,
    showAutocomplete,
    suggestionIndex,
    navigateList,
    filteredSuggestions,
  };
}
