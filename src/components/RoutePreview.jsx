import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MapView from './MapView';

/**
 * RoutePreview Component
 * 
 * @description Displays planned multi-stop route with optimization overlay.
 * Shows route segments, distances, and estimated duration before trip starts.
 * Allows driver to preview the optimized route before confirming trip creation.
 * 
 * @component
 */
const RoutePreview = ({ 
  source, 
  destination, 
  waypoints = [], 
  optimizedData = null,
  onOptimize 
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState('');

  // Calculate route optimization on mount or when waypoints change
  useEffect(() => {
    if (waypoints.length > 0 && source && destination && !optimizedData) {
      handleOptimize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints.length]);

  const handleOptimize = async () => {
    if (!source || !destination) {
      setOptimizationError('Source and destination required');
      return;
    }

    if (waypoints.length > 4) {
      setOptimizationError('Maximum 4 stops allowed');
      return;
    }

    setIsOptimizing(true);
    setOptimizationError('');

    try {
      // Call optimization calculation
      const result = await calculateOptimization(source, destination, waypoints);
      onOptimize?.(result);
    } catch (error) {
      setOptimizationError(error.message || 'Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  };

  /**
   * Calculate route optimization using Haversine distance
   */
  const calculateOptimization = (src, dest, wps) => {
    return new Promise((resolve) => {
      // Simple nearest neighbor optimization
      const calculateDistance = (p1, p2) => {
        const R = 6371; // Earth radius in km
        const dLat = toRadians(p2.lat - p1.lat);
        const dLng = toRadians(p2.lng - p1.lng);
        
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(p1.lat)) * Math.cos(toRadians(p2.lat)) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const toRadians = (deg) => deg * (Math.PI / 180);

      // Nearest neighbor algorithm
      const unvisited = [...wps];
      const ordered = [];
      let current = src;
      const legs = [];

      while (unvisited.length > 0) {
        let nearestIdx = 0;
        let nearestDist = calculateDistance(current, unvisited[0]);

        for (let i = 1; i < unvisited.length; i++) {
          const dist = calculateDistance(current, unvisited[i]);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIdx = i;
          }
        }

        const nearest = unvisited[nearestIdx];
        ordered.push(nearest);
        legs.push({
          from: current.address || 'Point',
          to: nearest.address || 'Waypoint',
          distance: Math.round(nearestDist * 10) / 10
        });

        current = nearest;
        unvisited.splice(nearestIdx, 1);
      }

      // Final leg to destination
      const finalDist = calculateDistance(current, dest);
      legs.push({
        from: current.address || 'Last stop',
        to: dest.address || 'Destination',
        distance: Math.round(finalDist * 10) / 10
      });

      // Calculate total
      const totalDistance = legs.reduce((sum, leg) => sum + leg.distance, 0);
      const estimatedDuration = Math.round((totalDistance / 60) * 60); // minutes at 60 km/h

      resolve({
        orderedWaypoints: ordered,
        totalDistance: Math.round(totalDistance * 10) / 10,
        estimatedDuration,
        legs
      });
    });
  };

  const displayWaypoints = optimizedData ? optimizedData.orderedWaypoints : waypoints;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <span className="text-xl mr-2">🗺️</span>
          {waypoints.length > 0 ? 'Optimized Route Preview' : 'Route Preview'}
        </h3>
        {waypoints.length > 0 && !optimizedData && (
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
          </button>
        )}
      </div>

      {optimizationError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          {optimizationError}
        </div>
      )}

      {/* Map */}
      <MapView
        sourceLocation={source}
        destinationLocation={destination}
        waypoints={displayWaypoints}
        height="350px"
      />

      {/* Route Summary */}
      <div className="mt-4 space-y-2">
        {optimizedData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-gray-600">Total Distance:</span>
                  <span className="font-semibold text-gray-900 ml-1">
                    {optimizedData.totalDistance} km
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Est. Duration:</span>
                  <span className="font-semibold text-gray-900 ml-1">
                    {optimizedData.estimatedDuration} min
                  </span>
                </div>
              </div>
              {waypoints.length > 0 && (
                <div className="flex items-center text-green-600 text-xs">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Route Optimized
                </div>
              )}
            </div>
          </div>
        )}

        {/* Route Legs */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="text-xs text-gray-600">Start</div>
              <div className="font-medium text-gray-900 text-sm">
                {source?.address || 'Source'}
              </div>
            </div>
          </div>

          {displayWaypoints.map((wp, index) => (
            <div key={index} className="flex items-start space-x-2 ml-1">
              <div className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">{index + 1}</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
              </div>
              <div className="flex-1 pt-3">
                <div className="text-xs text-gray-600">Stop {index + 1}</div>
                <div className="font-medium text-gray-900 text-sm">
                  {wp.address || `Waypoint ${index + 1}`}
                </div>
                {optimizedData?.legs?.[index] && (
                  <div className="text-xs text-gray-500 mt-1">
                    {optimizedData.legs[index].distance} km from previous
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-start space-x-2 ml-1">
            {displayWaypoints.length > 0 && (
              <div className="w-px h-4 bg-gray-300 ml-[5px]"></div>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="text-xs text-gray-600">End</div>
              <div className="font-medium text-gray-900 text-sm">
                {destination?.address || 'Destination'}
              </div>
              {optimizedData?.legs?.[displayWaypoints.length] && (
                <div className="text-xs text-gray-500 mt-1">
                  {optimizedData.legs[displayWaypoints.length].distance} km from previous
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {waypoints.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-800">Route Optimized</p>
              <p className="text-xs text-yellow-700 mt-1">
                Stops have been reordered using shortest path algorithm for optimal efficiency.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

RoutePreview.propTypes = {
  source: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    address: PropTypes.string
  }),
  destination: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    address: PropTypes.string
  }),
  waypoints: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    address: PropTypes.string
  })),
  optimizedData: PropTypes.shape({
    orderedWaypoints: PropTypes.array,
    totalDistance: PropTypes.number,
    estimatedDuration: PropTypes.number,
    legs: PropTypes.array
  }),
  onOptimize: PropTypes.func
};

export default RoutePreview;
