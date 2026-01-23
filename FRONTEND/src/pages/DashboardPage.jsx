import React, { useEffect, useState } from 'react';
import RiskStatsCards from '../components/dashboard/RiskStatsCards';
import RiskMap from '../components/dashboard/RiskMap';
import ForecastChart from '../components/dashboard/ForecastChart';
import DistrictPanel from '../components/dashboard/DistrictPanel';
import { getRiskStats, getForecastData, getDistrictList, getMapData } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, forecastData, districtsData, mapData] = await Promise.all([
          getRiskStats(),
          getForecastData(),
          getDistrictList(),
          getMapData()
        ]);
        
        setStats(statsData);
        setForecast(forecastData);
        setDistricts(districtsData);
        setMapData(mapData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Haryana Groundwater Monitor</h1>
           <p className="text-muted-foreground mt-1">Real-time surveillance and forecasting system for {stats?.totalDistricts || 208} districts.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           Live Data Stream
        </div>
      </div>

      <RiskStatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RiskMap data={mapData} loading={loading} />
          <ForecastChart data={forecast} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <DistrictPanel 
            districts={districts} 
            selectedDistrict={selectedDistrict} 
            onSelect={setSelectedDistrict} 
          />
        </div>
      </div>
    </div>
  );
}
