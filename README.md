# metarr

Web app to check any airport's METAR.

Uses HTML5 Geolocation API to get nearest METAR stations to your position if desired.

Shows both raw METAR data and shows small insights of the parsed conditions.

Built using [Nuxt.js](https://nuxt.com/), [Vue 3](https://vuejs.org/) and [Leaflet](https://leafletjs.com/).

Airport data is sourced from [OurAirports](https://ourairports.com/) consumed through [AirAPI](https://github.com/alrico88/airapi) and comes with no guarantee of accuracy or fitness for use. METAR data is sourced from [aviationweather.gov](https://aviationweather.gov/).

## License

Made by [Alberto Rico](https://alrico.es)

Published under MIT License.

## Development

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

### Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install --shamefully-hoist
```

### Development Server

Start the development server on http://localhost:3000

```bash
pnpm run dev
```

### Production

Build the application for production:

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
