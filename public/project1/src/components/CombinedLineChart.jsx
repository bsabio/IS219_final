import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchDepressionData, fetchDigitalMediaData, formatNumber } from '../utils/dataUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CombinedChart() {
  const [depressionData, setDepressionData] = useState([]);
  const [digitalMediaData, setDigitalMediaData] = useState([]);
  const [combinedData, setCombinedData] = useState({
    labels: [],
    datasets: [],
    originalData: []
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
      
      // Get all unique years from both datasets, sorted chronologically
      const depressionYears = depressionResults.map(item => item.year);
      const mediaYears = mediaResults.map(item => item.year);
      const allYears = [...new Set([...depressionYears, ...mediaYears])].sort();
      
      // Filter for overlapping years for better visualization
      const filteredYears = allYears.filter(year => {
        const hasDepressionData = depressionResults.some(d => d.year === year);
        const hasMediaData = mediaResults.some(m => m.year === year);
        return hasDepressionData && hasMediaData;
      }).sort();

      // Extract all depression and media values for proper min/max calculation
      const allDepressionValues = depressionResults.map(item => item.percent).filter(val => val !== null && !isNaN(val));
      const allMediaValues = mediaResults.map(item => item.hours).filter(val => val !== null && !isNaN(val));

      // Extract values specific to filtered years
      const depressionValues = filteredYears.map(year => {
        const match = depressionResults.find(item => item.year === year);
        return match ? match.percent : null;
      }).filter(val => val !== null);

      const mediaValues = filteredYears.map(year => {
        const match = mediaResults.find(item => item.year === year);
        return match ? match.hours : null;
      }).filter(val => val !== null);

      // Calculate min and max for normalization from full datasets
      // This ensures a more consistent scale across all possible years
      const depressionMin = Math.min(...allDepressionValues);
      const depressionMax = Math.max(...allDepressionValues);
      const mediaMin = Math.min(...allMediaValues);
      const mediaMax = Math.max(...allMediaValues);

      // Store original and normalized values for tooltip display
      const originalData = filteredYears.map(year => {
        const depressionMatch = depressionResults.find(item => item.year === year);
        const mediaMatch = mediaResults.find(item => item.year === year);

        // Calculate normalized values for display
        const normalizedDepression = depressionMatch ?
          ((depressionMatch.percent - depressionMin) / (depressionMax - depressionMin)) * 100 : null;
        const normalizedMedia = mediaMatch ?
          ((mediaMatch.hours - mediaMin) / (mediaMax - mediaMin)) * 100 : null;

        return {
          year,
          depression: depressionMatch ? depressionMatch.percent : null,
          media: mediaMatch ? mediaMatch.hours : null,
          normalizedDepression,
          normalizedMedia,
          depressionScaled: depressionMatch ? depressionMatch.percent / 100 : null, // Scaled down by 100
          lowerCI: depressionMatch ? depressionMatch.lowerCI : null,
          upperCI: depressionMatch ? depressionMatch.upperCI : null,
          lowerCIScaled: depressionMatch ? depressionMatch.lowerCI / 100 : null, // Scaled down by 100
          upperCIScaled: depressionMatch ? depressionMatch.upperCI / 100 : null, // Scaled down by 100
          minutes: mediaMatch ? mediaMatch.minutes : null,
          depressionMin,
          depressionMax,
          mediaMin,
          mediaMax
        };
      });

      // Create combined dataset with fully normalized values for better comparison
      setCombinedData({
        labels: filteredYears,
        datasets: [
          {
            label: 'Depression Rate (normalized)',
            data: filteredYears.map(year => {
              const match = depressionResults.find(item => item.year === year);
              if (!match) return null;
              // Normalize depression data to 0-100 scale
              return ((match.percent - depressionMin) / (depressionMax - depressionMin)) * 100;
            }),
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2.5,
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4,
            order: 1, // Display this dataset on top
            stepped: false // Smooth line
          },
          {
            label: 'Digital Media Usage (normalized)',
            data: filteredYears.map(year => {
              const match = mediaResults.find(item => item.year === year);
              if (!match) return null;
              // Normalize media data to 0-100 scale
              return ((match.hours - mediaMin) / (mediaMax - mediaMin)) * 100;
            }),
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.4)',
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            order: 2 // Display this dataset below the first one
          }
        ],
        originalData // Store original values for tooltip display
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
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
        text: 'Depression Rates vs. Digital Media Usage',
        font: {
          size: 22,
          weight: 'bold',
          family: 'Arial'
        },
        color: '#ffffff',
        padding: {
          top: 10,
          bottom: 30
        }
      },
      subtitle: {
        display: false,
        text: 'Digital Media values multiplied by 2 for better comparison (Actual values shown in tooltips)',
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
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const originalData = combinedData.originalData?.[context.dataIndex];

              // Always show the normalized value first (percentage of max in dataset)
              label += formatNumber(context.parsed.y) + '% (normalized)';

              if (context.datasetIndex === 0 && originalData) {
                // Show original depression value in a normalized way (1 decimal place)
                label += ` - Original: ${originalData.depressionScaled.toFixed(2)}`;

                // Add confidence interval if available (also normalized)
                if (originalData.lowerCIScaled && originalData.upperCIScaled) {
                  label += ` (95% CI: ${originalData.lowerCIScaled.toFixed(2)}-${originalData.upperCIScaled.toFixed(2)})`;
                }
              } else if (originalData) {
                // Show original media value
                label += ` - Original: ${formatNumber(originalData.media)} hours/day`;

                // Add minutes if available
                if (originalData.minutes) {
                  label += ` (${Math.round(originalData.minutes)} min/day)`;
                }
              }
            }
            return label;
          },
          footer: function(context) {
            return 'Source: LGHC & Statista Data';
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: false, // Hide the entire y-axis
        position: 'left',
        title: {
          display: false,
          text: 'Normalized Value (%)',
          font: {
            size: 14,
            weight: 'bold',
            family: 'Arial'
          },
          color: 'rgba(255, 255, 255, 0.9)',
          padding: { bottom: 15 }
        },
        min: 0, // Begin at zero
        max: 100, // End at 100 since we normalized to 0-100 scale
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
          display: false, // Hide title
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
    elements: {
      line: {
        borderJoinStyle: 'round'
      },
      point: {
        hitRadius: 10,
        hoverRadius: 8
      }
    }
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
      <Line data={combinedData} options={options} />
      <div className="chart-note">
        <p>This normalized area chart compares depression rates (red) with daily digital media consumption (blue) from 2012-2018.</p>
        <p>Both metrics are normalized to a 0-100% scale to allow direct comparison of trends regardless of their different units.</p>
        <p>Depression rates are displayed as decimal values (0.0-0.2) rather than percentages for easier comparison.</p>
        <p><strong>Source:</strong> Depression data from LGHC indicators; digital media usage from Statista.</p>
      </div>
    </div>
  );
}

export default CombinedChart;