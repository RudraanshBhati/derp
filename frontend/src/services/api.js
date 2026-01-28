// Groundwater Monitoring API Service

const API_BASE = "http://localhost:8000/api";

// Helper function for error handling
const handleResponse = async (response) => {
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

// Helper to calculate risk percentage from RMSE and MAE
const calculateRiskPercentage = (rmse, mae) => {
    // Higher RMSE/MAE = higher risk
    // Normalize to 0-100 scale (assuming max RMSE ~10)
    const normalizedRisk = Math.min(100, ((rmse * 5) + (mae * 5)));
    return Math.round(normalizedRisk);
};

/**
 * Get dashboard statistics
 * Returns: avgLevel, criticalDistricts, forecastTrend, rainfallIndex, changeRate
 */
export const getRiskStats = async () => {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error fetching risk stats:", error);
        // Fallback mock data
        return {
            avgLevel: 10.6,
            avgPredictedLevel: 9.5,
            criticalDistricts: 84,
            warningDistricts: 58,
            safeDistricts: 66,
            totalDistricts: 208,
            forecastTrend: 'declining',
            rainfallIndex: 78.5,
            changeRate: -10.38
        };
    }
};

/**
 * Get forecast time series data
 * Returns: array of { month, historical, predicted, district }
 */
export const getForecastData = async () => {
    try {
        const response = await fetch(`${API_BASE}/dashboard/forecast`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        return [
            { month: 'Jan 2024', historical: 12, predicted: 12 },
            { month: 'Feb 2024', historical: 13, predicted: 12.8 },
            { month: 'Mar 2024', historical: 14, predicted: 13.5 },
        ];
    }
};

/**
 * Get list of all districts
 * Returns: array of districts with performance metrics
 */
export const getDistrictList = async () => {
    try {
        const response = await fetch(`${API_BASE}/districts`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error fetching district list:", error);
        return [];
    }
};

/**
 * Get detailed information for a specific district
 * @param {string} districtName - Name of the district
 * Returns: detailed metrics, time series, and advisory
 */
export const getDistrictDetail = async (districtName) => {
    try {
        const response = await fetch(`${API_BASE}/districts/${encodeURIComponent(districtName)}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching district detail for ${districtName}:`, error);
        return null;
    }
};

/**
 * Get map data for all districts
 * Returns: array of districts with lat/lng and risk metrics
 */
export const getMapData = async () => {
    try {
        const districts = await getDistrictList();
        
        // Transform to map-friendly format with risk percentage
        return districts.map(district => ({
            id: district.id,
            name: district.name,
            lat: district.lat,
            lng: district.lng,
            level: district.level,
            predictedLevel: district.predictedLevel,
            status: district.status,
            risk: calculateRiskPercentage(district.rmse, district.mae),
            rmse: district.rmse,
            mae: district.mae,
            village: district.village,
            block: district.block
        }));
    } catch (error) {
        console.error("Error fetching map data:", error);
        return [];
    }
};

/**
 * Get districts in GeoJSON format for map rendering
 */
export const getDistrictsGeoJSON = async () => {
    try {
        const response = await fetch(`${API_BASE}/geojson/districts`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error fetching GeoJSON:", error);
        return { type: "FeatureCollection", features: [] };
    }
};

/**
 * Get model performance metrics
 */
export const getModelMetrics = async () => {
    try {
        const response = await fetch(`${API_BASE}/model/metrics`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error fetching model metrics:", error);
        return [];
    }
};

/**
 * Health check
 */
export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE}/health`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error checking health:", error);
        return { status: 'unhealthy', error: error.message };
    }
};

/**
 * Chatbot: Get context for user message
 * This endpoint extracts district and returns real-time data
 * Frontend should then call Gemini API with the returned context
 */
export const getChatbotContext = async (message, district = null) => {
    try {
        const response = await fetch(`${API_BASE}/chatbot/context`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, district })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Error getting chatbot context:", error);
        return {
            district_found: null,
            district_data: null,
            context: "Unable to connect to the backend API.",
            suggestion: "error"
        };
    }
};

/**
 * Get prediction data for a specific district
 */
export const getDistrictPredictions = async (districtName) => {
    try {
        const response = await fetch(`${API_BASE}/districts/${encodeURIComponent(districtName)}`);
        const data = await handleResponse(response);
        return data.predictions || [];
    } catch (error) {
        console.error(`Error fetching predictions for ${districtName}:`, error);
        return [];
    }
};

