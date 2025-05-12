import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  fetchDepressionData, 
  fetchDigitalMediaData, 
  createCoordinatedDatasets, 
  normalizeData, 
  formatNumber 
} from '../utils/dataUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function NormalizedComparisonChart() {
  const [depressionData, setDepressionData] = useState([]);
  const [digitalMediaData, setDigitalMediaData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingRetry, setIsLoadingRetry] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both datasets concurrently
      const [depressionResults, mediaResults] = await Promise.all([
        fetchDepressionData(),
        fetchDigitalMediaData()
      ]);
      
      setDepressionData(depressionResults);
      setDigitalMediaData(mediaResults);
      
      // Find overlapping years
      const depressionYears = depressionResults.map(item => item.year);
      const mediaYears = mediaResults.map(item => item.year);
      
      const overlappingYears = depressionYears
        .filter(year => mediaYears.includes(year))
        .sort();
      
      if (overlappingYears.length === 0) {
        setError('No overlapping years between the two datasets.');
        setLoading(false);
        return;
      }
      
      // Extract values for overlapping years
      const depressionValues = overlappingYears.map(year => {
        const match = depressionResults.find(item => item.year === year);
        return match ? match.percent : null;
      }).filter(val => val !== null);
      
      const mediaValues = overlappingYears.map(year => {
        const match = mediaResults.find(item => item.year === year);
        return match ? match.hours : null;
      }).filter(val => val !== null);
      
      // Calculate min and max for normalization
      const depressionMin = Math.min(...depressionValues);
      const depressionMax = Math.max(...depressionValues);
      const mediaMin = Math.min(...mediaValues);
      const mediaMax = Math.max(...mediaValues);
      
      // Normalize the data
      const normalizedDepression = normalizeData(depressionValues, depressionMin, depressionMax);
      const normalizedMedia = normalizeData(mediaValues, mediaMin, mediaMax);
      
      // Store original values for tooltips
      const originalValues = overlappingYears.map((year, index) => ({
        year,
        depression: depressionValues[index],
        media: mediaValues[index],
        depressionMin,
        depressionMax,
        mediaMin,
        mediaMax
      }));
      
      // Set chart data with improved styling
      setChartData({
        labels: overlappingYears,
        datasets: [
          {
            label: 'Depression (normalized)',
            data: normalizedDepression,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            hoverBackgroundColor: 'rgba(255, 99, 132, 0.9)',
            maxBarThickness: 35,
          },
          {
            label: 'Digital Media Usage (normalized)',
            data: normalizedMedia,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            hoverBackgroundColor: 'rgba(54, 162, 235, 0.9)',
            maxBarThickness: 35,
          }
        ],
        originalValues // Store original values for tooltip display
      });
      
      setLoading(false);
      setIsLoadingRetry(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Could not load data: ${err.message}`);
      setLoading(false);
      setIsLoadingRetry(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = () => {
    setIsLoadingRetry(true);
    loadData();
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          usePointStyle: true,
          padding: 20,
          boxWidth: 40,
          boxHeight: 3,
        }
      },
      title: {
        display: false,
        text: 'Normalized Comparison: Depression vs. Digital Media Usage',
        font: {
          size: 22,
          weight: 'bold',
          family: 'Arial'
        },
        color: '#ffffff',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      subtitle: {
        display: false,
        text: 'Both metrics scaled to 0-100% for direct trend comparison',
        font: {
          size: 16,
          family: 'Arial'
        },
        color: '#cccccc',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 14 },
        padding: 15,
        cornerRadius: 6,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          title: function(context) {
            return `Year: ${context[0].label}`;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const originalValues = chartData.originalValues?.[index];

            if (label) {
              label += ': ';
            }

            if (context.parsed.y !== null) {
              // Add normalized value
              label += formatNumber(context.parsed.y) + '% (normalized)';

              // Add original value if available
              if (originalValues) {
                if (datasetIndex === 0) {
                  label += ` - Original: ${formatNumber(originalValues.depression)}%`;
                } else if (datasetIndex === 1) {
                  label += ` - Original: ${formatNumber(originalValues.media)} hours/day`;
                }
              }
            }

            return label;
          },
          footer: function(tooltipItems) {
            const datasetIndex = tooltipItems[0].datasetIndex;
            const index = tooltipItems[0].dataIndex;
            const originalValues = chartData.originalValues?.[index];

            if (originalValues) {
              if (datasetIndex === 0) {
                return `Data Range: ${formatNumber(originalValues.depressionMin)}% - ${formatNumber(originalValues.depressionMax)}%`;
              } else {
                return `Data Range: ${formatNumber(originalValues.mediaMin)} - ${formatNumber(originalValues.mediaMax)} hrs/day`;
              }
            }

            return 'Values normalized to 0-100% scale for comparison';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        display: false, // Hide the entire y-axis
        title: {
          display: false,
          text: 'Normalized Values (%)',
          font: {
            size: 14,
            weight: 'bold',
            family: 'Arial'
          },
          color: 'rgba(255, 255, 255, 0.9)',
          padding: { bottom: 15 }
        },
        grid: {
          display: false, // Hide grid lines
          drawBorder: false
        },
        ticks: {
          display: false // Hide tick marks and labels
        },
        border: {
          display: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year',
          font: {
            size: 14,
            weight: 'bold',
            family: 'Arial'
          },
          color: 'rgba(255, 255, 255, 0.9)',
          padding: { top: 15 }
        },
        grid: {
          display: false, // Hide grid lines
          drawBorder: false // Hide the axis line
        },
        ticks: {
          display: false  // Hide the x-axis ticks and labels
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    barPercentage: 0.7,
    categoryPercentage: 0.8
  };

  if (loading) {
    return (
      <div className="chart-loading">
        <div className="loading-spinner"></div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error">
        <p>{error}</p>
        <button 
          onClick={handleRetry} 
          disabled={isLoadingRetry}
          className="retry-button"
        >
          {isLoadingRetry ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
      <div className="chart-note">
        <p>This bar chart compares depression rates (red) with daily digital media consumption (blue) from 2012-2018 using a normalized scale.</p>
        <p>Both metrics are normalized to a 0-100% scale to allow direct comparison of trends regardless of their different units.</p>
        <p><strong>Source:</strong> Depression data from LGHC indicators; digital media usage from Statista.</p>
      </div>
    </div>
  );
}

export default NormalizedComparisonChart;