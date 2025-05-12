import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('../components/Navbar'), { ssr: false });
const Footer = dynamic(() => import('../components/Footer'), { ssr: false });

import styles from '../styles/DataVisualization.module.css';

export default function DataVisualization() {
  const [depressionData, setDepressionData] = useState([]);
  const [mediaData, setMediaData] = useState([]);
  const [activeTab, setActiveTab] = useState('combined'); // Only combined and media tabs now
  const [selectedChart, setSelectedChart] = useState('double');
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Function to fetch and parse CSV data
    const fetchCSV = async (file) => {
      try {
        console.log(`Fetching CSV from: ${file}`);
        const response = await fetch(file);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        console.log(`CSV text length: ${text.length} characters`);

        // Log a small preview of the CSV content
        console.log(`CSV preview: ${text.substring(0, 100)}...`);

        const rows = text.split('\n');
        console.log(`Total rows in CSV: ${rows.length}`);

        const data = [];

        // Different parsing logic based on the file
        if (file.includes('depression')) {
          // Depression data format: Year,Strata,Strata Name,Frequency,Weighted Frequency,Percent,Lower 95% CL,Upper 95% CL
          const startRow = 1; // Skip header

          for (let i = startRow; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;

            const cells = rows[i].split(',');
            if (cells.length >= 6) { // We need at least 6 columns (including Percent at index 5)
              data.push({
                label: cells[0], // Year
                value: parseFloat(cells[5]) // Percent
              });
            }
          }
        } else if (file.includes('media')) {
          // Media data has a different format - need to skip header rows
          const startRow = 3; // Skip title rows

          for (let i = startRow; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;

            const cells = rows[i].split(',');
            if (cells.length >= 2) {
              // Some cells might include additional commas in quoted strings
              data.push({
                label: cells[0].trim(), // Year
                value: parseFloat(cells[1].trim()) // Minutes
              });
            }
          }
        } else {
          // Generic CSV parser as fallback
          const startRow = 1; // Skip header row

          for (let i = startRow; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;

            const cells = rows[i].split(',');
            if (cells.length >= 2) {
              data.push({
                label: cells[0],
                value: parseFloat(cells[1])
              });
            }
          }
        }

        console.log(`Parsed ${data.length} data points from ${file}`);
        return data;
      } catch (error) {
        console.error('Error loading CSV:', error);
        return [];
      }
    };

    // Load data on component mount
    const loadData = async () => {
      try {
        console.log('Attempting to fetch CSV files...');

        // Define possible paths for CSV files
        const possibleDepressionPaths = [
          '/project1/public/adult-depression-lghc-indicator-24.csv',
          './project1/public/adult-depression-lghc-indicator-24.csv',
          '../project1/public/adult-depression-lghc-indicator-24.csv',
          '/public/project1/public/adult-depression-lghc-indicator-24.csv'
        ];

        const possibleMediaPaths = [
          '/project1/public/statistic_id262340_time-spent-with-digital-media-in-the-us-2011-2024.csv',
          './project1/public/statistic_id262340_time-spent-with-digital-media-in-the-us-2011-2024.csv',
          '../project1/public/statistic_id262340_time-spent-with-digital-media-in-the-us-2011-2024.csv',
          '/public/project1/public/statistic_id262340_time-spent-with-digital-media-in-the-us-2011-2024.csv'
        ];

        // Try to load depression data from different paths
        let depressionData = [];
        for (const path of possibleDepressionPaths) {
          console.log('Trying depression data URL:', path);
          try {
            const data = await fetchCSV(path);
            if (data && data.length > 0) {
              console.log('Successfully loaded depression data from:', path);
              depressionData = data;
              break;
            }
          } catch (e) {
            console.log('Failed to load from:', path);
          }
        }

        // Try to load media data from different paths
        let mediaData = [];
        for (const path of possibleMediaPaths) {
          console.log('Trying media data URL:', path);
          try {
            const data = await fetchCSV(path);
            if (data && data.length > 0) {
              console.log('Successfully loaded media data from:', path);
              mediaData = data;
              break;
            }
          } catch (e) {
            console.log('Failed to load from:', path);
          }
        }

        // If everything fails, use sample data
        if (depressionData.length === 0) {
          console.warn('Unable to load depression data from any source. Using sample data.');
          depressionData = [
            { label: '2012', value: 11.74 },
            { label: '2013', value: 13.08 },
            { label: '2014', value: 13.30 },
            { label: '2015', value: 12.92 },
            { label: '2016', value: 13.77 },
            { label: '2017', value: 19.04 },
            { label: '2018', value: 17.78 }
          ];
        }

        if (mediaData.length === 0) {
          console.warn('Unable to load media data from any source. Using sample data.');
          mediaData = [
            { label: '2011', value: 214 },
            { label: '2012', value: 250 },
            { label: '2013', value: 288 },
            { label: '2014', value: 309 },
            { label: '2015', value: 328 },
            { label: '2016', value: 343 },
            { label: '2017', value: 353 },
            { label: '2018', value: 380 }
          ];
        }

        console.log('Depression data loaded:', depressionData.length, 'rows');
        console.log('Media data loaded:', mediaData.length, 'rows');

        // Log sample data
        if (depressionData.length > 0) {
          console.log('Depression data sample:', depressionData.slice(0, 3));
        }

        if (mediaData.length > 0) {
          console.log('Media data sample:', mediaData.slice(0, 3));
        }

        setDepressionData(depressionData);
        setMediaData(mediaData);
      } catch (error) {
        console.error('Error loading CSV data:', error);

        // Use fallback data in case of error
        const fallbackDepressionData = [
          { label: '2012', value: 11.74 },
          { label: '2013', value: 13.08 },
          { label: '2014', value: 13.30 },
          { label: '2015', value: 12.92 },
          { label: '2016', value: 13.77 },
          { label: '2017', value: 19.04 },
          { label: '2018', value: 17.78 }
        ];

        const fallbackMediaData = [
          { label: '2011', value: 214 },
          { label: '2012', value: 250 },
          { label: '2013', value: 288 },
          { label: '2014', value: 309 },
          { label: '2015', value: 328 },
          { label: '2016', value: 343 },
          { label: '2017', value: 353 },
          { label: '2018', value: 380 }
        ];

        setDepressionData(fallbackDepressionData);
        setMediaData(fallbackMediaData);
      }
    };

    if (isClient) {
      loadData();
    }
  }, [isClient]);

  // Create a simple visualization based on the tabular data
  const renderSimpleBarChart = (data, maxValue) => {
    return (
      <div className={styles.simpleChart}>
        {data.map((item, index) => (
          <div key={index} className={styles.barItem}>
            <div className={styles.barLabel}>{item.label}</div>
            <div className={styles.barContainer}>
              <div 
                className={styles.barFill} 
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: activeTab === 'combined' 
                    ? 'rgba(165, 200, 228, 0.7)' 
                    : index % 2 === 0 
                      ? 'rgba(165, 200, 228, 0.7)' 
                      : 'rgba(216, 194, 248, 0.7)'
                }}
              >
                <span className={styles.barValue}>{item.value.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Line chart rendering function has been removed

  // Comparative line chart with normalized data (percentages)
  const renderDoubleLineChart = (data1, data2, maxValue1, maxValue2) => {
    if (!data1 || !data2 || data1.length === 0 || data2.length === 0) return null;

    const width = 800;
    const height = 400;
    const padding = 50;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // We need to create a combined dataset with matching years
    const years = [...new Set([
      ...data1.map(d => d.label),
      ...data2.map(d => d.label)
    ])].sort();

    const combined = years.map(year => {
      const depression = data1.find(d => d.label === year);
      const media = data2.find(d => d.label === year);
      return {
        year,
        depression: depression ? depression.value : null,
        media: media ? media.value : null
      };
    }).filter(d => d.depression !== null && d.media !== null);

    // Calculate normalized values for both datasets (0-100%)
    const depressionMin = Math.min(...combined.map(item => item.depression));
    const depressionMax = Math.max(...combined.map(item => item.depression));
    const mediaMin = Math.min(...combined.map(item => item.media));
    const mediaMax = Math.max(...combined.map(item => item.media));

    // Calculate points for both lines (normalized to 0-100%)
    const depressionPoints = combined.map((item, index) => {
      const x = padding + (index * (chartWidth / (combined.length - 1)));
      const normalizedValue = ((item.depression - depressionMin) / (depressionMax - depressionMin)) * 100;
      const y = height - padding - ((normalizedValue / 100) * chartHeight);
      return `${x},${y}`;
    }).join(' ');

    const mediaPoints = combined.map((item, index) => {
      const x = padding + (index * (chartWidth / (combined.length - 1)));
      const normalizedValue = ((item.media - mediaMin) / (mediaMax - mediaMin)) * 100;
      const y = height - padding - ((normalizedValue / 100) * chartHeight);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className={styles.lineChartContainer}>
        <div className={styles.legendContainer}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 99, 132, 0.7)' }}></div>
            <span>Depression Rate (normalized %)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: 'rgba(54, 162, 235, 0.7)' }}></div>
            <span>Media Consumption (normalized %)</span>
          </div>
        </div>

        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* X and Y axes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />
          <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((val, i) => (
            <line
              key={i}
              x1={padding}
              y1={height - padding - (chartHeight * val)}
              x2={width - padding}
              y2={height - padding - (chartHeight * val)}
              stroke="#eee"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}

          {/* Area fills for better visualization */}
          <path
            d={`M${padding},${height - padding} ${depressionPoints} L${width - padding},${height - padding} Z`}
            fill="rgba(255, 99, 132, 0.3)"
            stroke="none"
          />

          <path
            d={`M${padding},${height - padding} ${mediaPoints} L${width - padding},${height - padding} Z`}
            fill="rgba(54, 162, 235, 0.3)"
            stroke="none"
          />

          {/* Depression line */}
          <polyline
            fill="none"
            stroke="rgba(255, 99, 132, 0.9)"
            strokeWidth="3"
            points={depressionPoints}
          />

          {/* Media consumption line */}
          <polyline
            fill="none"
            stroke="rgba(54, 162, 235, 0.9)"
            strokeWidth="3"
            points={mediaPoints}
          />

          {/* Data points */}
          {combined.map((item, index) => {
            const x = padding + (index * (chartWidth / (combined.length - 1)));
            const depressionNormalized = ((item.depression - depressionMin) / (depressionMax - depressionMin)) * 100;
            const mediaNormalized = ((item.media - mediaMin) / (mediaMax - mediaMin)) * 100;
            const depressionY = height - padding - ((depressionNormalized / 100) * chartHeight);
            const mediaY = height - padding - ((mediaNormalized / 100) * chartHeight);

            return (
              <g key={index}>
                {/* Depression data point */}
                <circle cx={x} cy={depressionY} r="6" fill="rgba(255, 99, 132, 0.9)" />
                <text x={x} y={depressionY - 15} textAnchor="middle" fontSize="12" fill="rgba(255, 99, 132, 0.9)">
                  {depressionNormalized.toFixed(0)}%
                </text>

                {/* Media consumption data point */}
                <circle cx={x} cy={mediaY} r="6" fill="rgba(54, 162, 235, 0.9)" />
                <text x={x} y={mediaY + 20} textAnchor="middle" fontSize="12" fill="rgba(54, 162, 235, 0.9)">
                  {mediaNormalized.toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {combined.map((item, index) => {
            const x = padding + (index * (chartWidth / (combined.length - 1)));
            return (
              <text key={index} x={x} y={height - padding + 20} textAnchor="middle" fontSize="12">{item.year}</text>
            );
          })}

          {/* Y-axis labels (normalized percentages) */}
          {[0, 25, 50, 75, 100].map((val, i) => {
            const yPos = height - padding - (chartHeight * (val / 100));
            return (
              <text key={`y-${i}`} x={padding - 10} y={yPos + 5} textAnchor="end" fontSize="12" fill="#555">
                {val}%
              </text>
            );
          })}

          {/* Scale explanation */}
          <text x={padding} y={padding - 25} textAnchor="start" fontSize="12" fill="#666">
            Depression: {depressionMin.toFixed(1)} - {depressionMax.toFixed(1)}%
          </text>
          <text x={width - padding} y={padding - 25} textAnchor="end" fontSize="12" fill="#666">
            Media: {mediaMin.toFixed(0)} - {mediaMax.toFixed(0)} min/day
          </text>
        </svg>

        <div className={styles.chartNotes}>
          <p>Both metrics are normalized to percentages (0-100%) for direct comparison of trends.</p>
          <p>Original values shown in the chart labels.</p>
        </div>
      </div>
    );
  };

  // Function to render a double bar chart
  const renderDoubleBarChart = (data1, data2) => {
    if (!data1 || !data2 || data1.length === 0 || data2.length === 0) return null;

    // We need to create a combined dataset with matching years
    const years = [...new Set([
      ...data1.map(d => d.label),
      ...data2.map(d => d.label)
    ])].sort();

    const combined = years.map(year => {
      const depression = data1.find(d => d.label === year);
      const media = data2.find(d => d.label === year);
      return {
        year,
        depression: depression ? depression.value : null,
        media: media ? media.value / 60 : null // Convert minutes to hours for better comparison
      };
    }).filter(d => d.depression !== null && d.media !== null);

    return (
      <div className={styles.doubleBarChart}>
        <div className={styles.legendContainer}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: 'rgba(165, 200, 228, 0.7)' }}></div>
            <span>Depression Rate (%)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: 'rgba(216, 194, 248, 0.7)' }}></div>
            <span>Media Consumption (hours/day)</span>
          </div>
        </div>

        {combined.map((item, index) => (
          <div key={index} className={styles.doubleBarItem}>
            <div className={styles.doubleBarYear}>{item.year}</div>
            <div className={styles.doubleBarsContainer}>
              <div className={styles.doubleBarSet}>
                <div className={styles.doubleBarLabel}>Depression</div>
                <div className={styles.doubleBarWrapper}>
                  <div
                    className={styles.doubleBarFill}
                    style={{
                      width: `${(item.depression / 25) * 100}%`,
                      backgroundColor: 'rgba(165, 200, 228, 0.7)'
                    }}
                  >
                    <span>{item.depression.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className={styles.doubleBarSet}>
                <div className={styles.doubleBarLabel}>Media Use</div>
                <div className={styles.doubleBarWrapper}>
                  <div
                    className={styles.doubleBarFill}
                    style={{
                      width: `${(item.media / 10) * 100}%`,
                      backgroundColor: 'rgba(216, 194, 248, 0.7)'
                    }}
                  >
                    <span>{item.media.toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Prepare yearly depression data for time series
  const yearlyDepressionData = depressionData
    .filter(item => item.label.match(/^\d{4}$/)) // Filter only year entries
    .map(item => ({
      label: item.label,
      value: parseFloat(item.value)
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));

  // Process the media data to ensure proper format
  const yearlyMediaData = mediaData
    .filter(item => item.label.match(/^\d{4}$/)) // Filter only year entries
    .map(item => ({
      label: item.label,
      value: parseFloat(item.value)
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));

  // Filtered data for other visualizations
  const processedDepressionData = depressionData
    .filter(item => item.label.includes('Total'))
    .slice(0, 5);

  const processedMediaData = mediaData.slice(0, 5);

  // Find max values for proper scaling
  const maxDepressionValue = Math.max(...(processedDepressionData.map(item => item.value) || [0]));
  const maxMediaValue = Math.max(...(processedMediaData.map(item => item.value) || [0]));

  // Max values for yearly data
  const maxYearlyDepressionValue = Math.max(...(yearlyDepressionData.map(item => item.value) || [0]));
  const maxYearlyMediaValue = Math.max(...(yearlyMediaData.map(item => item.value) || [0]));

  return (
    <div className={styles.container}>
      <Head>
        <title>Data Visualization | Brandon Sabio</title>
        <meta name="description" content="Interactive data visualization project showcasing data analysis capabilities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <h1>Data Visualization Project</h1>
              <p>Interactive visual exploration of depression data and media consumption trends</p>
              <div className={styles.badges}>
                <span className={styles.badge}>React</span>
                <span className={styles.badge}>Next.js</span>
                <span className={styles.badge}>CSS</span>
                <span className={styles.badge}>Data Analysis</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.overview}>
            <h2>Project Overview</h2>
            <p>
              This data visualization project examines the potential correlation between adult depression rates 
              and increasing digital media consumption. The project visualizes trends in the data to help identify 
              patterns and relationships between these two phenomena.
            </p>
          </div>
          
          <div className={styles.visualizationContainer}>
            <div className={styles.chartSelector}>
              <button
                className={`${styles.chartTab} ${activeTab === 'combined' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('combined')}
              >
                Correlation Analysis
              </button>
              <button
                className={`${styles.chartTab} ${activeTab === 'media' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('media')}
              >
                Media Usage Data
              </button>
            </div>

            <div className={styles.chartTypeSelector}>
              <button
                className={`${styles.chartTypeBtn} ${selectedChart === 'bar' ? styles.activeChartType : ''}`}
                onClick={() => setSelectedChart('bar')}
              >
                Bar Chart
              </button>
              <button
                className={`${styles.chartTypeBtn} ${selectedChart === 'double' ? styles.activeChartType : ''}`}
                onClick={() => setSelectedChart('double')}
              >
                Line Chart
              </button>
            </div>

            <div className={styles.chartWrapper}>
              {/* Combined (Correlation) View */}
              {activeTab === 'combined' && (
                <div>
                  <h3 className={styles.chartTitle}>Depression Rates vs. Media Consumption (2012-2018)</h3>
                  {selectedChart === 'double' && (
                    renderDoubleLineChart(
                      yearlyDepressionData,
                      yearlyMediaData,
                      maxYearlyDepressionValue,
                      maxYearlyMediaValue
                    )
                  )}
                  {selectedChart === 'bar' && (
                    renderDoubleBarChart(yearlyDepressionData, yearlyMediaData)
                  )}
                  {/* Line chart removed */}
                  <div className={styles.chartDescription}>
                    <p>
                      This visualization compares depression rates and digital media consumption
                      from 2012 to 2018, with both metrics normalized to percentages (0-100%) for direct comparison.
                      The data suggests a potential correlation between increasing media usage and rising depression rates.
                    </p>
                    <p>
                      The normalization allows us to see the relative changes in both metrics on the same scale,
                      making it easier to identify parallel trends regardless of their different units of measurement.
                    </p>
                    <p>
                      Note that while both metrics show an upward trend, this correlation does
                      not necessarily imply causation. Other societal factors may also contribute
                      to these parallel increases.
                    </p>
                  </div>
                </div>
              )}

              {/* Depression Data View removed */}

              {/* Media Usage Data View */}
              {activeTab === 'media' && processedMediaData.length > 0 && (
                <div>
                  <h3 className={styles.chartTitle}>Digital Media Consumption (Hours/Day)</h3>
                  {selectedChart === 'bar' && renderSimpleBarChart(processedMediaData, maxMediaValue)}
                  {/* Line chart removed */}
                  {selectedChart === 'double' && renderSimpleBarChart(processedMediaData, maxMediaValue)}
                  <div className={styles.chartDescription}>
                    <p>
                      This chart shows daily digital media consumption over several years.
                      The data represents average hours per day spent with digital media.
                    </p>
                    <p>
                      Note the steady increase in consumption over time, suggesting growing
                      digital media use across the population.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.dataSection}>
            <h2>Data Sources</h2>
            <div className={styles.dataGrid}>
              <div className={styles.dataCard}>
                <h3>Adult Depression Data</h3>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Value (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depressionData.slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          <td>{row.label}</td>
                          <td>{row.value.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className={styles.dataCard}>
                <h3>Digital Media Consumption Data</h3>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Hours per Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mediaData.map((row, index) => (
                        <tr key={index}>
                          <td>{row.label}</td>
                          <td>{row.value.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.projectDetails}>
            <h2>Analysis & Findings</h2>
            <p>
              This analysis explores two key datasets:
            </p>
            <ul>
              <li>Depression rates across different demographic groups from 2016-2020</li>
              <li>Digital media consumption trends from 2012-2020</li>
            </ul>
            
            <p>Key observations from the data:</p>
            <ul>
              <li>Depression rates show variation across different demographics</li>
              <li>Digital media consumption has steadily increased over the past decade</li>
              <li>While not proving causation, there appears to be a correlation between 
                  increasing media consumption and rising depression rates</li>
              <li>Further research is needed to explore potential causal relationships</li>
            </ul>
            
            <div className={styles.cta}>
              <Link href="/" className={styles.backButton}>
                Return to Portfolio
              </Link>
              <a 
                href="https://github.com/bsabio/IS219_project1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.codeButton}
              >
                View Source Code
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}