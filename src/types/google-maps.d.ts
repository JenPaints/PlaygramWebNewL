// Google Maps TypeScript definitions

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getZoom(): number | undefined;
      fitBounds(bounds: LatLngBounds): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      setContent(content: string): void;
      open(map: Map, anchor?: Marker): void;
      close(): void;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLng | LatLngLiteral): void;
    }

    class DirectionsService {
      constructor();
      route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      styles?: MapTypeStyle[];
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon;
    }

    interface InfoWindowOptions {
      content?: string;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
      anchor?: Point;
    }

    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral | string;
      destination: LatLng | LatLngLiteral | string;
      travelMode: TravelMode;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
    }

    interface DirectionsLeg {
      distance: Distance;
      duration: Duration;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: any[];
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum DirectionsStatus {
      OK = 'OK',
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    namespace event {
      function addListenerOnce(instance: any, eventName: string, handler: Function): void;
    }

    namespace places {
      class PlacesService {
        constructor(attrContainer: Map | HTMLDivElement);
        nearbySearch(request: PlaceSearchRequest, callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void): void;
        getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void): void;
      }

      interface PlaceSearchRequest {
        location: LatLng | LatLngLiteral;
        radius: number;
        type?: string;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }

      interface PlaceResult {
        place_id?: string;
        name?: string;
        rating?: number;
        formatted_phone_number?: string;
        website?: string;
        opening_hours?: {
          weekday_text?: string[];
        };
        reviews?: PlaceReview[];
      }

      interface PlaceReview {
        rating: number;
        text: string;
        author_name: string;
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        NOT_FOUND = 'NOT_FOUND',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR'
      }
    }

    namespace event {
      function addListenerOnce(instance: any, eventName: string, handler: Function): void;
    }
  }
}

// Global google object
declare const google: typeof google;