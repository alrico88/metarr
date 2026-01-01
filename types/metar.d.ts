declare interface IMetar {
  raw_text: string;
  raw_parts: string[];
  icao: string;
  observed: string;
  wind: {
    degrees: number;
    speed_kts: number;
    speed_mps: number;
    gust_kts: any;
    gust_mps: any;
    degrees_from: any;
    degrees_to: any;
  };
  visibility: {
    miles: number;
    miles_text: string;
    meters: number;
    meters_text: string;
  };
  conditions: {
    code: string;
  }[];
  clouds: {
    code: string;
    feet: number;
    meters: number;
  }[];
  ceiling: {
    feet: number;
    meters: number;
  };
  temperature: {
    celsius: number;
    fahrenheit: number;
  };
  dewpoint: {
    celsius: number;
    fahrenheit: number;
  };
  humidity: {
    percent: number;
  };
  barometer: {
    hg: number;
    kpa: number;
    mb: number;
  };
  flight_category: string;
  icao_flight_category: string;
}

declare interface NearestStation {
  icaoId: string;
  iataId: string;
  faaId: string;
  wmoId: string;
  lat: number;
  lon: number;
  elev: number;
  site: string;
  state: string;
  country: string;
  priority: number;
}

declare interface NearestStationWithMetar extends NearestStation {
  metar: string;
}

declare interface NearestAirport {
  station: {
    icao: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  nautical_miles: number;
  metar: string;
}
