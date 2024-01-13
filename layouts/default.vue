<template lang="pug">
.d-flex.flex-column.h-100
  .py-4.flex-shrink-0
    header.container
      .row.mb-3
        .col
          nuxt-link.text-decoration-none.d-inline-block(to="/")
            h1.fw-bold.mb-0 #[img(src="/logo.png", width="43", height="30")] metarr
    main
      slot
  the-footer
</template>
