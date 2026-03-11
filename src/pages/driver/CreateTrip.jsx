import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import MapView from '../../components/MapView';
import FuelTypeSelect from '../../components/FuelTypeSelect';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    scheduledDate: '',
    scheduledTime: '',
    vehicleType: 'CAR',
    totalSeats: 4,
    fuelType: '',
  });

  const [sourceLocation, setSourceLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  // Get max date (7 days from now)
  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  // Get min date (now)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-adjust seats based on vehicle type
    if (name === 'vehicleType') {
      setFormData({
        ...formData,
        [name]: value,
        totalSeats: value === 'BIKE' ? 1 : 4,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSourceChange = (locationData) => {
    setSourceLocation(locationData);
    setFormData({
      ...formData,
      source: locationData?.address ?? locationData
    });
  };

  const handleDestinationChange = (locationData) => {
    setDestinationLocation(locationData);
    setFormData({
      ...formData,
      destination: locationData?.address ?? locationData
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.source || !formData.destination || !formData.scheduledDate || !formData.scheduledTime) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!formData.fuelType) {
        setError('Please select a fuel type');
        setLoading(false);
        return;
      }

      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}`;

      // Validate seats for CAR
      if (formData.vehicleType === 'CAR' && (formData.totalSeats < 1 || formData.totalSeats > 7)) {
        setError('Car seats must be between 1 and 7');
        setLoading(false);
        return;
      }

      // Create trip
      await tripService.createTrip({
        source: formData.source,
        destination: formData.destination,
        scheduledTime: scheduledDateTime,
        vehicleType: formData.vehicleType,
        fuelType: formData.fuelType,
        totalSeats: parseInt(formData.totalSeats),
        sourceLocation: sourceLocation?.lat && sourceLocation?.lng ? {
          address: sourceLocation.address,
          lat: sourceLocation.lat,
          lng: sourceLocation.lng
        } : null,
        destinationLocation: destinationLocation?.lat && destinationLocation?.lng ? {
          address: destinationLocation.address,
          lat: destinationLocation.lat,
          lng: destinationLocation.lng
        } : null
      });

      setSuccess('Trip created successfully!');

      // Reset form
      setFormData({
        source: '',
        destination: '',
        scheduledDate: '',
        scheduledTime: '',
        vehicleType: 'CAR',
        totalSeats: '4',
        fuelType: '',
      });
      setSourceLocation(null);
      setDestinationLocation(null);

      // Redirect to driver requests/trips page after 2 seconds
      setTimeout(() => {
        navigate('/driver/requests');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Create New Trip</h1>
            <p className="text-stone-600 mt-2">Fill in the details to create a new ride</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <LocationAutocomplete
              label="Source"
              value={formData.source}
              onChange={handleSourceChange}
              placeholder="Enter pickup location"
              required
            />

            <LocationAutocomplete
              label="Destination"
              value={formData.destination}
              onChange={handleDestinationChange}
              placeholder="Enter drop-off location"
              required
            />

            {/* Route Preview */}
            {((sourceLocation?.lat && sourceLocation?.lng) || (destinationLocation?.lat && destinationLocation?.lng)) && (
              <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                <h3 className="text-sm font-medium text-stone-700 mb-3">Route Preview</h3>
                <MapView
                  sourceLocation={sourceLocation}
                  destinationLocation={destinationLocation}
                  height="350px"
                />
                {sourceLocation && destinationLocation && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-900">Start</div>
                        <div className="text-stone-600 text-xs">{sourceLocation.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-900">End</div>
                        <div className="text-stone-600 text-xs">{destinationLocation.address}</div>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      ℹ️ Passenger pickup locations will be automatically optimized when you approve riders
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scheduled Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-stone-700 block mb-2">Scheduled Date *</span>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                  className="input-field cursor-pointer"
                />
                <p className="text-xs text-stone-500 mt-1">Max 7 days from now</p>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700 block mb-2">Scheduled Time *</span>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  required
                  className="input-field cursor-pointer"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Vehicle Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vehicleType"
                    value="CAR"
                    checked={formData.vehicleType === 'CAR'}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-700">Car</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vehicleType"
                    value="BIKE"
                    checked={formData.vehicleType === 'BIKE'}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-700">Bike</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Total Seats
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                min={formData.vehicleType === 'BIKE' ? 1 : 1}
                max={formData.vehicleType === 'BIKE' ? 1 : 7}
                disabled={formData.vehicleType === 'BIKE'}
                required
                className="input-field disabled:bg-stone-100"
              />
              <p className="text-xs text-stone-500 mt-1">
                {formData.vehicleType === 'BIKE'
                  ? 'Bike: 1 seat (fixed)'
                  : 'Car: 1-7 seats'}
              </p>
            </div>

            <FuelTypeSelect
              value={formData.fuelType}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading || !formData.fuelType}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="spinner" /> Creating Trip...</> : 'Create Trip'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/driver/requests')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ← Back to Ride Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
