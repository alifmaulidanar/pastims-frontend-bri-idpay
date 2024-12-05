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
}
