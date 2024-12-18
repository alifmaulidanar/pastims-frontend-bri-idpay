/* eslint-disable @typescript-eslint/no-unused-vars */
// leaflet-control-geocoder.d.ts
declare module "leaflet" {
  namespace Control {
    interface GeocoderOptions {
      placeholder?: string;
      errorMessage?: string;
    }

    class Geocoder {
      constructor(options?: GeocoderOptions);
      static nominatim(): Geocoder;
      addTo(map: Map): this;
    }
  }

  export function icon(arg0: { iconUrl: string; iconSize: number[]; iconAnchor: number[]; popupAnchor: number[]; }) {
    throw new Error("Function not implemented.");
  }
}
