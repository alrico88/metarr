declare interface Airport {
  id: number;
  icao: string;
  latitude: number;
  longitude: number;
  country: string;
  name: string;
  elevation: number;
  runwayCount: number;
  municipality: string;
  runways: Runway[];
}

declare interface Runway {
  ident: string;
  bearing: number;
  surface: string;
  length: number;
  width: number;
}
