import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { googleMapsService, Location, UserLocation } from '../../services/googleMaps';
import { toast } from 'sonner';

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  userLocation?: UserLocation;
  onLocationSelect: (location: Location) => void;
  selectedLocationId?: string;
}

const LocationMapModal: React.FC<LocationMapModalProps> = ({
  isOpen,
  onClose,
  locations,
  userLocation,
  onLocationSelect,
  selectedLocationId
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [sortedLocations, setSortedLocations] = useState<Location[]>([]);

  // Initialize Google Maps when modal opens
  useEffect(() => {
    if (isOpen && mapRef.current) {
      initializeMap();
    }
  }, [isOpen]);

  // Memoize locations to prevent unnecessary re-renders
  const memoizedLocations = useMemo(() => locations, [JSON.stringify(locations)]);

  // Sort locations by distance when user location or locations change
  useEffect(() => {
    if (userLocation && memoizedLocations.length > 0) {
      const locationsWithDistance = memoizedLocations.map(location => ({
        ...location,
        distance: googleMapsService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        )
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setSortedLocations(locationsWithDistance);
    } else {
      setSortedLocations(memoizedLocations);
    }
  }, [memoizedLocations, userLocation]);

  // Memoize updateMapMarkers to prevent infinite re-renders
  const updateMapMarkers = useCallback(() => {
    if (!isMapLoaded) return;

    // Add location markers with enhanced click functionality
    googleMapsService.addLocationMarkers(sortedLocations, (location) => {
      setSelectedLocation(location);
      // Scroll to the location in the sidebar
      const locationElement = document.getElementById(`location-${location._id}`);
      if (locationElement) {
        locationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        locationElement.style.backgroundColor = '#dbeafe';
        setTimeout(() => {
          locationElement.style.backgroundColor = '';
        }, 2000);
      }
    });

    // Add user location marker if available
    if (userLocation) {
      googleMapsService.addUserLocationMarker(userLocation);
    }

    // Fit map to show all locations
    googleMapsService.fitToLocations(sortedLocations, userLocation);
  }, [isMapLoaded, sortedLocations, userLocation]);

  // Update map when locations or user location changes
  useEffect(() => {
    if (isMapLoaded && sortedLocations.length > 0) {
      updateMapMarkers();
    }
  }, [isMapLoaded, sortedLocations]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      const initialized = await googleMapsService.initialize();
      if (!initialized) {
        toast.error('Unable to load map. Please check your internet connection.');
        return;
      }

      // Default center (Bangalore, India)
      const defaultCenter = { lat: 12.9716, lng: 77.5946 };
      const center = userLocation 
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : defaultCenter;

      const map = googleMapsService.createMap(mapRef.current, {
        center,
        zoom: userLocation ? 12 : 10
      });

      if (map) {
        setIsMapLoaded(true);
        console.log('✅ Map initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      toast.error('Failed to load map');
    }
  };



  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await googleMapsService.getCurrentLocation();
      
      if (isMapLoaded) {
        googleMapsService.addUserLocationMarker(location);
        googleMapsService.centerOnUserLocation(location, 12);
      }
      
      toast.success('Location detected! Showing nearby centers.');
      
      // You can emit this location to parent component if needed
      // onUserLocationUpdate?.(location);
    } catch (error) {
      console.error('Failed to get location:', error);
      toast.error('Could not get your location. Please enable location access.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    onClose();
  };

  const getDirections = async (location: Location) => {
    if (!userLocation) {
      toast.error('Please enable location access to get directions');
      return;
    }

    try {
      const directions = await googleMapsService.getDirections(userLocation, location);
      const route = directions.routes[0];
      if (route && route.legs[0]) {
        const leg = route.legs[0];
        toast.success(`Distance: ${leg.distance.text}, Duration: ${leg.duration.text}`);
      }
    } catch (error) {
      console.error('Failed to get directions:', error);
      toast.error('Could not get directions');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 md:flex md:items-center md:justify-center md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ 
          scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.95, 
          opacity: 0,
          y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0
        }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: 0
        }}
        exit={{ 
          scale: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0.95, 
          opacity: 0,
          y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0
        }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
        className="bg-white w-full h-full md:rounded-xl md:shadow-2xl md:w-full md:max-w-4xl md:h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 md:px-6 py-4 md:py-6 border-b bg-white relative">
          {/* Mobile pull indicator */}
          <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Choose Location</h2>
              <p className="text-gray-600 text-sm md:text-base mt-1 truncate">Select a training center near you</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl md:rounded-lg transition-colors touch-manipulation flex-shrink-0 ml-2"
            >
              <X size={24} className="md:w-5 md:h-5" />
            </button>
          </div>
          
          {/* Mobile: Full-width location button */}
          <div className="md:hidden">
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation shadow-lg"
            >
              <Navigation size={20} className={isLoadingLocation ? 'animate-spin' : ''} />
              <span className="font-semibold">{isLoadingLocation ? 'Getting Location...' : 'Find My Location'}</span>
            </button>
          </div>
          
          {/* Desktop: Compact location button */}
          <div className="hidden md:flex items-center justify-end">
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Navigation size={16} className={isLoadingLocation ? 'animate-spin' : ''} />
              <span>{isLoadingLocation ? 'Getting Location...' : 'My Location'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Map */}
          <div className="h-64 md:h-auto md:flex-1 relative order-1 md:order-1">
            <div 
              ref={mapRef} 
              className="w-full h-full"
              style={{ minHeight: '256px' }}
            />
            {!isMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Location List */}
          <div className="flex-1 md:w-80 md:flex-none border-t md:border-t-0 md:border-l bg-gray-50 flex flex-col order-2 md:order-2">
            <div className="p-4 md:p-4 flex-1 overflow-y-auto max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-200px)]">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg md:text-base">
                Available Locations ({sortedLocations.length})
                {userLocation && <span className="text-sm font-normal text-gray-600 hidden md:inline"> - Sorted by distance</span>}
              </h3>
              <div className="space-y-4 md:space-y-3">
                {sortedLocations.map((location, index) => {
                   const locationImage = (location as any).imageUrl || 'https://jenpaints.art/wp-content/uploads/2025/08/PHOTO-2025-08-17-11-01-50.jpg';
                   const facilities = (location as any).facilities || [];
                   const contactPhone = (location as any).contactPhone || (location as any).phone;
                   const state = (location as any).state;
                   const pincode = (location as any).pincode;
                  
                  return (
                    <div
                      key={location._id}
                      id={`location-${location._id}`}
                      className={`p-5 md:p-4 bg-white rounded-xl md:rounded-lg border-2 md:border cursor-pointer transition-all hover:shadow-md touch-manipulation ${
                        selectedLocationId === location._id ? 'border-cyan-400 bg-cyan-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      } ${selectedLocation?._id === location._id ? 'ring-2 ring-cyan-300' : ''}`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      {/* Location Image */}
                      <div className="mb-4 md:mb-3">
                        <img 
                          src={locationImage} 
                          alt={location.name}
                          className="w-full h-40 md:h-32 object-cover rounded-lg md:rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150/3B82F6/white?text=Sports+Center';
                          }}
                        />
                      </div>
                      
                      <div className="flex items-start justify-between mb-3 md:mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 md:mb-1">
                            <h4 className="font-semibold md:font-medium text-gray-900 text-lg md:text-base">{location.name}</h4>
                            {index === 0 && userLocation && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Nearest
                              </span>
                            )}
                          </div>
                          
                          {/* Contact Phone */}
                           {contactPhone && (
                             <div className="flex items-center mb-2">
                               <span className="text-blue-600 text-sm">📞 {contactPhone}</span>
                             </div>
                           )}
                           
                           <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                           <p className="text-sm text-gray-500 mb-1">{location.city}{state && `, ${state}`}</p>
                           {pincode && (
                             <p className="text-sm text-gray-500 mb-2">PIN: {pincode}</p>
                           )}
                          
                          {/* Distance */}
                          {location.distance && (
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin size={12} className="text-blue-500" />
                              <p className="text-sm text-blue-600 font-medium">
                                {location.distance.toFixed(1)} km away
                              </p>
                              <span className="text-xs text-gray-500">
                                (~{Math.ceil(location.distance * 2)} min drive)
                              </span>
                            </div>
                          )}
                          
                          {/* Facilities */}
                           <div className="mb-3">
                             <p className="text-xs font-medium text-gray-700 mb-1">🏆 Facilities:</p>
                             <div className="flex flex-wrap gap-1">
                               {facilities && facilities.length > 0 ? (
                                 <>
                                   {facilities.slice(0, 3).map((facility: string, idx: number) => (
                                     <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                       {facility}
                                     </span>
                                   ))}
                                   {facilities.length > 3 && (
                                     <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                       +{facilities.length - 3} more
                                     </span>
                                   )}
                                 </>
                               ) : (
                                 <span className="text-xs text-gray-500 italic">No facilities listed</span>
                               )}
                             </div>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 md:space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocationSelect(location);
                          }}
                          className="flex-1 px-6 py-4 md:px-3 md:py-2 bg-blue-600 text-white text-base md:text-sm rounded-xl md:rounded-md hover:bg-blue-700 transition-colors font-semibold md:font-medium touch-manipulation shadow-lg md:shadow-none"
                        >
                          Select Location
                        </button>
                        {userLocation && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              getDirections(location);
                            }}
                            className="px-4 py-4 md:px-3 md:py-2 border-2 md:border border-gray-300 text-gray-700 text-base md:text-sm rounded-xl md:rounded-md hover:bg-gray-50 transition-colors touch-manipulation flex items-center justify-center"
                            title="Get Directions"
                          >
                            <Navigation size={18} className="md:w-3.5 md:h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <div className="border-t bg-white p-4 md:p-4 safe-area-inset-bottom">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-lg md:text-base truncate">{selectedLocation.name}</h4>
                <p className="text-sm text-gray-600 truncate">{selectedLocation.address}, {selectedLocation.city}</p>
                {selectedLocation.distance && (
                  <p className="text-sm text-blue-600 font-medium">
                    {selectedLocation.distance.toFixed(1)} km away
                  </p>
                )}
              </div>
              
              {/* Mobile: Stack buttons vertically */}
              <div className="md:hidden space-y-3">
                <button
                  onClick={() => handleLocationSelect(selectedLocation)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold touch-manipulation shadow-lg"
                >
                  <MapPin size={20} />
                  <span>Select This Location</span>
                </button>
                {userLocation && (
                  <button
                    onClick={() => getDirections(selectedLocation)}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium touch-manipulation"
                  >
                    <Navigation size={20} />
                    <span>Get Directions</span>
                  </button>
                )}
              </div>
              
              {/* Desktop: Horizontal buttons */}
              <div className="hidden md:flex space-x-2">
                {userLocation && (
                  <button
                    onClick={() => getDirections(selectedLocation)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Navigation size={16} />
                    <span>Directions</span>
                  </button>
                )}
                <button
                  onClick={() => handleLocationSelect(selectedLocation)}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MapPin size={16} />
                  <span>Select Location</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LocationMapModal;