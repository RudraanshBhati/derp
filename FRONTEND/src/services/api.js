// Mock API Service

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getRiskStats = async () => {
    await delay(1000); // Simulate network latency
    return {
        avgLevel: 14.5, // meters
        criticalDistricts: 12,
        forecastTrend: 'declining', // 'stable', 'improving', 'declining'
        rainfallIndex: 85, // out of 100
        changeRate: -2.3 // percentage
    };
};

export const getForecastData = async () => {
    await delay(1200);
    return [
        { month: 'Jan', historical: 12, predicted: 12 },
        { month: 'Feb', historical: 13, predicted: 12.8 },
        { month: 'Mar', historical: 14, predicted: 13.5 },
        { month: 'Apr', historical: 15, predicted: 15.2 },
        { month: 'May', historical: 16, predicted: 16.5 },
        { month: 'Jun', historical: 15.5, predicted: 16.0 },
        { month: 'Jul', historical: 14, predicted: 14.2 },
    ];
};

export const getDistrictList = async () => {
    await delay(500);
    return [
        { id: 1, name: 'Bangalore Urban', level: 22.5, status: 'Critical' },
        { id: 2, name: 'Mumbai City', level: 10.2, status: 'Safe' },
        { id: 3, name: 'Chennai', level: 18.1, status: 'Warning' },
        { id: 4, name: 'Delhi', level: 35.0, status: 'Critical' },
        { id: 5, name: 'Hyderabad', level: 15.5, status: 'Warning' },
        { id: 6, name: 'Pune', level: 12.3, status: 'Safe' },
        { id: 7, name: 'Jaipur', level: 40.2, status: 'Critical' },
    ];
};

// Mock GeoJSON data generator for India districts (simplified for demo)
export const getMapData = async () => {
  await delay(1500);
  // In a real app, this would fetch a large GeoJSON. 
  // Here we just return points or simplified polygons to render markers.
  return [
    { id: 1, name: "Bangalore Urban", lat: 12.9716, lng: 77.5946, risk: 85, level: 22.5 },
    { id: 2, name: "Mumbai City", lat: 19.0760, lng: 72.8777, risk: 30, level: 10.2 },
    { id: 3, name: "Chennai", lat: 13.0827, lng: 80.2707, risk: 65, level: 18.1 },
    { id: 4, name: "Delhi", lat: 28.7041, lng: 77.1025, risk: 92, level: 35.0 },
    { id: 5, name: "Hyderabad", lat: 17.3850, lng: 78.4867, risk: 60, level: 15.5 },
    { id: 6, name: "Pune", lat: 18.5204, lng: 73.8567, risk: 45, level: 12.3 },
    { id: 7, name: "Jaipur", lat: 26.9124, lng: 75.7873, risk: 88, level: 40.2 },
    { id: 8, name: "Kolkata", lat: 22.5726, lng: 88.3639, risk: 55, level: 14.5 },
    { id: 9, name: "Ahmedabad", lat: 23.0225, lng: 72.5714, risk: 70, level: 25.1 },
    { id: 10, name: "Lucknow", lat: 26.8467, lng: 80.9462, risk: 50, level: 16.8 },
  ];
};
