export function upperRef(initialVal: string) {
  const ogRef = ref(initialVal);

  return computed({
    get() {
      return ogRef.value;
    },
    set(val: string) {
      ogRef.value = val.toUpperCase();
    },
  });
}
