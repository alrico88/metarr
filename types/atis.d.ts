declare interface Atis {
  type: "combined" | "arr" | "dep";
  code: string;
  datis: string;
  time: string;
}
