import { Id } from '../../convex/_generated/dataModel';

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Location {
  _id: Id<"locations">;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId?: string;
}

class GoogleMapsService {
  private map: google.maps.Map | undefined = undefined;
  private markers: google.maps.Marker[] = [];
  private userLocationMarker: google.maps.Marker | undefined = undefined;
  private infoWindow: google.maps.InfoWindow | undefined = undefined;
  private isLoaded = false;

  /**
   * Initialize Google Maps API
   */
  async initialize(): Promise<boolean> {
    if (this.isLoaded) {
      return true;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('⚠️ Google Maps API key not found. Location features will be limited.');
      return false;
    }

    try {
      // Check if Google Maps is already loaded
      if (typeof google !== 'undefined' && google.maps) {
        this.isLoaded = true;
        return true;
      }

      // Load Google Maps API
      await this.loadGoogleMapsScript();
      this.isLoaded = true;
      console.log('✅ Google Maps API loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load Google Maps API:', error);
      return false;
    }
  }

  /**
   * Load Google Maps script dynamically
   */
  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Create a map instance
   */
  createMap(container: HTMLElement, options: MapOptions): google.maps.Map | undefined {
    if (!this.isLoaded || typeof google === 'undefined') {
      console.error('Google Maps not loaded');
      return undefined;
    }

    try {
      this.map = new google.maps.Map(container, {
        center: options.center,
        zoom: options.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      this.infoWindow = new google.maps.InfoWindow();
      return this.map;
    } catch (error) {
      console.error('Failed to create map:', error);
      return undefined;
    }
  }

  /**
   * Add location markers to the map
   */
  addLocationMarkers(
    locations: Location[], 
    onMarkerClick?: (location: Location) => void
  ): void {
    if (!this.map || !this.isLoaded) return;

    // Clear existing markers
    this.clearMarkers();

    locations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: this.map!,
        title: location.name,
        icon: {
          url: 'https://jenpaints.art/wp-content/uploads/2025/08/Untitled_design__11_-removebg-preview.png',
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 40)
        }
      });

      // Add click listener
         marker.addListener('click', async () => {
           if (this.infoWindow && this.map) {
             const distance = location.distance ? location.distance.toFixed(1) : 'N/A';
             const locationImage = (location as any).imageUrl || 'https://jenpaints.art/wp-content/uploads/2025/08/PHOTO-2025-08-17-11-01-50.jpg';
             const facilities = (location as any).facilities || [];
             const contactPhone = (location as any).contactPhone || (location as any).phone || '+91 98765 43210';
             const state = (location as any).state || '';
             const pincode = (location as any).pincode || '';
             
             // Try to get Google Places data
             let placesData = null;
             try {
               placesData = await this.getPlaceDetails(location.latitude, location.longitude);
             } catch (error) {
               console.log('Places API not available or failed:', error);
             }
            
            const content = `
               <div style="padding: 12px; max-width: 320px; font-family: Arial, sans-serif;">
                 <!-- Location Image -->
                 <div style="margin-bottom: 12px;">
                   <img src="${locationImage}" alt="${location.name}" 
                        style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" 
                        onerror="this.src='https://via.placeholder.com/300x150/3B82F6/white?text=Sports+Center'" />
                 </div>
                 
                 <!-- Location Header -->
                 <div style="margin-bottom: 12px;">
                   <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #1f2937;">${location.name}</h3>
                   ${placesData && placesData.rating ? `
                     <div style="display: flex; align-items: center; margin-bottom: 4px;">
                       <span style="color: #fbbf24; margin-right: 4px;">★★★★☆</span>
                       <span style="font-size: 12px; color: #6b7280;">${placesData.rating}/5</span>
                       <span style="font-size: 10px; color: #9ca3af; margin-left: 4px;">(Google Reviews)</span>
                     </div>
                   ` : ''}
                   ${location.distance ? `
                     <div style="display: flex; align-items: center; margin-bottom: 8px;">
                       <span style="color: #3B82F6; font-size: 14px; font-weight: bold;">📍 ${distance} km away</span>
                     </div>
                   ` : ''}
                 </div>
                 
                 <!-- Location Details -->
                 <div style="margin-bottom: 12px;">
                   <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px; line-height: 1.4;">
                     <strong>📍 Address:</strong><br/>${location.address}, ${location.city}${state ? `, ${state}` : ''}${pincode ? ` - ${pincode}` : ''}
                   </p>
                   <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">
                     <strong>📞 Contact:</strong> ${contactPhone}
                   </p>
                   ${placesData && placesData.website ? `
                     <p style="margin: 0 0 6px 0; color: #4b5563; font-size: 14px;">
                       <strong>🌐 Website:</strong> <a href="${placesData.website}" target="_blank" style="color: #3B82F6;">${placesData.website}</a>
                     </p>
                   ` : ''}
                 </div>
                 
                 <!-- Facilities -->
                 <div style="margin-bottom: 12px;">
                   <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: #1f2937;">🏆 Facilities:</p>
                   <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                     ${facilities.length > 0 ? facilities.slice(0, 4).map((facility: string) => 
                       `<span style="background: #e5f3ff; color: #1e40af; padding: 2px 6px; border-radius: 12px; font-size: 11px;">${facility}</span>`
                     ).join('') : '<span style="color: #6b7280; font-size: 12px;">No facilities listed</span>'}
                     ${facilities.length > 4 ? `<span style="background: #f3f4f6; color: #6b7280; padding: 2px 6px; border-radius: 12px; font-size: 11px;">+${facilities.length - 4} more</span>` : ''}
                   </div>
                 </div>
                 
                 ${placesData && placesData.openingHours ? `
                   <!-- Opening Hours -->
                   <div style="margin-bottom: 12px;">
                     <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: #1f2937;">🕒 Hours:</p>
                     <p style="margin: 0; font-size: 12px; color: #4b5563;">${placesData.openingHours}</p>
                   </div>
                 ` : ''}
                 
                 <!-- Action Buttons -->
                 <div style="display: flex; gap: 8px; margin-top: 12px;">
                   <button onclick="window.open('https://maps.google.com/maps?daddr=${location.latitude},${location.longitude}', '_blank')" 
                           style="flex: 1; background: #3B82F6; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: bold;">
                     🧭 Directions
                   </button>
                   <button onclick="window.open('tel:${contactPhone}', '_self')" 
                           style="flex: 1; background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: bold;">
                     📞 Call
                   </button>
                 </div>
                 
                 <!-- Distance Info -->
                 ${location.distance ? `
                   <div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #3B82F6;">
                     <p style="margin: 0; font-size: 12px; color: #1e40af;">
                       <strong>🚗 Distance:</strong> ${distance} km from your location<br/>
                       <strong>⏱️ Est. Time:</strong> ${Math.ceil(location.distance * 2)} mins by car
                     </p>
                   </div>
                 ` : ''}
                 
                 ${placesData ? `
                   <div style="margin-top: 8px; padding: 4px; text-align: center;">
                     <span style="font-size: 10px; color: #9ca3af;">📍 Enhanced with Google Places data</span>
                   </div>
                 ` : ''}
               </div>
             `;
            
            this.infoWindow.setContent(content);
            this.infoWindow.open(this.map, marker);
          }
        
        if (onMarkerClick) {
          onMarkerClick(location);
        }
      });

      this.markers.push(marker);
    });
  }

  /**
   * Add user location marker
   */
  addUserLocationMarker(userLocation: UserLocation): void {
    if (!this.map || !this.isLoaded) return;

    // Remove existing user location marker
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
    }

    this.userLocationMarker = new google.maps.Marker({
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      map: this.map!,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#10B981" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12)
      }
    });
  }

  /**
   * Center map on user location
   */
  centerOnUserLocation(userLocation: UserLocation, zoom: number = 12): void {
    if (!this.map) return;

    this.map.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    this.map.setZoom(zoom);
  }

  /**
   * Fit map to show all locations
   */
  fitToLocations(locations: Location[], userLocation?: UserLocation): void {
    if (!this.map || locations.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    // Add location bounds
    locations.forEach(location => {
      bounds.extend({ lat: location.latitude, lng: location.longitude });
    });

    // Add user location if available
    if (userLocation) {
      bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
    }

    this.map.fitBounds(bounds);
    
    // Ensure minimum zoom level
    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      if (this.map && this.map.getZoom() && this.map.getZoom()! > 15) {
        this.map.setZoom(15);
      }
    });
  }

  /**
   * Clear all markers
   */
  clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  /**
   * Get user's current location using browser geolocation
   */
  getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: false, // Use network location for faster response
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 600000 // 10 minutes cache
        }
      );
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get Google Places details for a location
   */
  async getPlaceDetails(latitude: number, longitude: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isLoaded || typeof google === 'undefined') {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const service = new google.maps.places.PlacesService(this.map!);
      const request = {
        location: { lat: latitude, lng: longitude },
        radius: 50, // 50 meters radius
        type: 'establishment'
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const place = results[0];
          
          // Get detailed information
          const detailRequest = {
            placeId: place.place_id!,
            fields: ['name', 'rating', 'formatted_phone_number', 'website', 'opening_hours', 'reviews']
          };
          
          service.getDetails(detailRequest, (placeDetails, detailStatus) => {
            if (detailStatus === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
              resolve({
                name: placeDetails.name,
                rating: placeDetails.rating,
                phone: placeDetails.formatted_phone_number,
                website: placeDetails.website,
                openingHours: placeDetails.opening_hours?.weekday_text?.join(', '),
                reviews: placeDetails.reviews
              });
            } else {
              reject(new Error(`Place details request failed: ${detailStatus}`));
            }
          });
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  /**
   * Get directions between two points
   */
  getDirections(
    origin: UserLocation, 
    destination: Location
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      if (!this.isLoaded || typeof google === 'undefined') {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: { lat: origin.latitude, lng: origin.longitude },
          destination: { lat: destination.latitude, lng: destination.longitude },
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  /**
   * Check if Google Maps is available
   */
  isAvailable(): boolean {
    return this.isLoaded && typeof google !== 'undefined' && !!google.maps;
  }

  /**
   * Destroy map instance and clean up
   */
  destroy(): void {
    this.clearMarkers();
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
      this.userLocationMarker = undefined;
    }
    if (this.infoWindow) {
      this.infoWindow.close();
      this.infoWindow = undefined;
    }
    this.map = undefined;
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
export default googleMapsService;

// Export types
export type { Location, UserLocation, MapOptions };