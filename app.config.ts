export default defineAppConfig({
  ui: {
    colors: {
      primary: "navy",
      neutral: "slate",
    },
    header: {
      slots: {
        left: "md:flex-1 flex items-center gap-1.5",
        center: "hidden md:flex",
        right: "flex items-center justify-end md:flex-1 gap-1.5",
        toggle: "md:hidden",
        content: "md:hidden",
        overlay: "md:hidden",
      },
    },
    card: {
      slots: {
        header: "px-4 py-2.5 sm:px-4 sm:py-2.5",
        body: "p-0 sm:p-0",
      },
    },
  },
});
