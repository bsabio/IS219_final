/**
 * Utility functions for data handling, fetching and processing
 */

import Papa from 'papaparse';

/**
 * Fetches and parses depression data from CSV
 * @returns {Promise<Array>} Array of processed depression data objects
 */
export const fetchDepressionData = async () => {
  try {
    const response = await fetch('/adult-depression-lghc-indicator-24.csv');
    if (!response.ok) {
      throw new Error('Depression CSV file not found or server error');
    }
    
    const data = await response.text();
    const parsedData = Papa.parse(data, { header: true }).data;
    
    // Clean up the data by removing empty rows
    const cleanData = parsedData.filter(row => 
      row['Year'] && row['Strata'] && row['Percent'] !== undefined
    );
    
    // Filter for Total strata
    const filteredData = cleanData.filter(row => row['Strata'] === 'Total');
    
    if (filteredData.length === 0) {
      throw new Error('No depression data found for "Total" strata');
    }
    
    // Create an array of objects with year and percentage
    return filteredData.map(row => ({
      year: row['Year'],
      percent: parseFloat(row['Percent']) || 0,
      lowerCI: parseFloat(row['Lower 95% CL']) || 0,
      upperCI: parseFloat(row['Upper 95% CL']) || 0
    }));
  } catch (error) {
    console.error('Error fetching depression data:', error);
    throw error;
  }
};

/**
 * Fetches and parses digital media usage data from CSV
 * @returns {Promise<Array>} Array of processed digital media data objects
 */
export const fetchDigitalMediaData = async () => {
  try {
    const response = await fetch('/statistic_id262340_time-spent-with-digital-media-in-the-us-2011-2024.csv');
    if (!response.ok) {
      throw new Error('Digital media CSV file not found or server error');
    }
    
    const data = await response.text();
    const parsedData = Papa.parse(data, { header: false }).data;
    
    // Skip the header rows (first 3 lines) and parse the data
    const mediaData = parsedData.slice(3)
      .filter(row => row.length >= 2 && row[0] && row[1])
      .map(row => {
        const year = row[0].trim();
        const minutesPerDay = parseFloat(row[1]);
        
        if (isNaN(minutesPerDay)) {
          console.warn(`Invalid data for year ${year}: ${row[1]}`);
          return null;
        }
        
        return {
          year,
          // Convert minutes to hours for consistency
          hours: minutesPerDay / 60,
          minutes: minutesPerDay
        };
      })
      .filter(item => item !== null);
    
    if (mediaData.length === 0) {
      throw new Error('No valid digital media data found');
    }
    
    return mediaData;
  } catch (error) {
    console.error('Error fetching digital media data:', error);
    throw error;
  }
};

/**
 * Finds overlapping years between two datasets and returns coordinated values
 * @param {Array} dataset1 First dataset of objects with 'year' property
 * @param {Array} dataset2 Second dataset of objects with 'year' property
 * @param {string} value1Key Property name for values in first dataset
 * @param {string} value2Key Property name for values in second dataset
 * @returns {Object} Object with years, values1, values2, and metadata
 */
export const createCoordinatedDatasets = (dataset1, dataset2, value1Key, value2Key) => {
  // Get lists of years from both datasets
  const years1 = dataset1.map(item => item.year);
  const years2 = dataset2.map(item => item.year);
  
  // Find overlapping years, sorted chronologically
  const overlappingYears = years1
    .filter(year => years2.includes(year))
    .sort();
  
  if (overlappingYears.length === 0) {
    throw new Error('No overlapping years found between the datasets');
  }
  
  // Extract values for overlapping years
  const values1 = overlappingYears.map(year => {
    const match = dataset1.find(item => item.year === year);
    return match ? match[value1Key] : null;
  }).filter(val => val !== null);
  
  const values2 = overlappingYears.map(year => {
    const match = dataset2.find(item => item.year === year);
    return match ? match[value2Key] : null;
  }).filter(val => val !== null);
  
  return {
    years: overlappingYears,
    values1,
    values2,
    dataset1Metadata: {
      min: Math.min(...values1),
      max: Math.max(...values1),
      avg: values1.reduce((a, b) => a + b, 0) / values1.length
    },
    dataset2Metadata: {
      min: Math.min(...values2),
      max: Math.max(...values2),
      avg: values2.reduce((a, b) => a + b, 0) / values2.length
    }
  };
};

/**
 * Normalizes a dataset to a 0-100 scale
 * @param {Array} data Array of numeric values
 * @param {number} min Minimum value in the dataset
 * @param {number} max Maximum value in the dataset
 * @returns {Array} Array of normalized values (0-100)
 */
export const normalizeData = (data, min, max) => {
  if (min === max) {
    return data.map(() => 50); // Return middle value if all data points are the same
  }
  return data.map(value => ((value - min) / (max - min)) * 100);
};

/**
 * Formats a numeric value with proper decimal places
 * @param {number} value The value to format
 * @param {number} [decimals=2] Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  return value.toFixed(decimals);
};