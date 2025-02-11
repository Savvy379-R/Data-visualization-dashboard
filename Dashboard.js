import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const API_BASE_URL = "http://127.0.0.1:5000"; // Update if needed

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState([]);
  const [filters, setFilters] = useState({
    country: '',
    sector: '',
    topic: '',
    region: '',
    end_year: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch data from /data endpoint with filters applied
  const fetchData = async () => {
    setLoading(true);
    try {
      let queryParams = Object.entries(filters)
        .filter(([key, value]) => value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${API_BASE_URL}/data${queryParams ? '?' + queryParams : ''}`;
      const response = await fetch(url);
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const statsData = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const chartData = {
    labels: stats.map(item => item._id || 'Unknown'),
    datasets: [
      {
        label: 'Average Intensity',
        data: stats.map(item => item.avg_intensity.toFixed(2)),
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      }
    ]
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header"><strong>Filter Data</strong></div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Country" name="country" value={filters.country} onChange={handleFilterChange} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Sector" name="sector" value={filters.sector} onChange={handleFilterChange} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Topic" name="topic" value={filters.topic} onChange={handleFilterChange} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Region" name="region" value={filters.region} onChange={handleFilterChange} />
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="End Year" name="end_year" value={filters.end_year} onChange={handleFilterChange} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><strong>Data Table</strong></div>
        <div className="card-body">
          {loading ? <p>Loading data...</p> : data.length === 0 ? <p>No records found.</p> : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>End Year</th>
                    <th>Intensity</th>
                    <th>Sector</th>
                    <th>Topic</th>
                    <th>Region</th>
                    <th>Country</th>
                    <th>Relevance</th>
                    <th>Pestle</th>
                    <th>Source</th>
                    <th>Likelihood</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.end_year || 'N/A'}</td>
                      <td>{item.intensity}</td>
                      <td>{item.sector || 'N/A'}</td>
                      <td>{item.topic || 'N/A'}</td>
                      <td>{item.region || 'N/A'}</td>
                      <td>{item.country || 'N/A'}</td>
                      <td>{item.relevance}</td>
                      <td>{item.pestle || 'N/A'}</td>
                      <td>{item.source || 'N/A'}</td>
                      <td>{item.likelihood}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><strong>Average Intensity per Sector</strong></div>
        <div className="card-body">
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }}}} height={300} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
