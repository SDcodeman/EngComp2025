/**
 * CSV Logger utility for storing camera data in browser storage
 * Uses IndexedDB for efficient storage and retrieval
 */

const DB_NAME = 'SewerMonitorDB';
const STORE_NAME = 'cameraLogs';
const DB_VERSION = 1;
const MAX_DAYS_RETENTION = 7; // Keep raw data for 7 days

/**
 * Initialize IndexedDB database
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });

        // Create indexes for efficient querying
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('segmentID', 'segmentID', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

/**
 * Log camera data to IndexedDB
 * @param {Array} cameraData - Array of camera objects
 */
export async function logCameraData(cameraData) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD

    // Store each camera's data
    for (const camera of cameraData) {
      const logEntry = {
        timestamp: timestamp.toISOString(),
        date: dateStr,
        segmentID: camera.SegmentID,
        position: camera.Position,
        water: camera.Water,
        light: camera.Light,
        status: camera.Status,
      };

      objectStore.add(logEntry);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('Error logging camera data:', error);
    throw error;
  }
}

/**
 * Get all logs within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of log entries
 */
export async function getLogsByDateRange(startDate, endDate) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('timestamp');

    const range = IDBKeyRange.bound(
      startDate.toISOString(),
      endDate.toISOString()
    );

    return new Promise((resolve, reject) => {
      const request = index.getAll(range);

      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
}

/**
 * Get logs for a specific camera segment
 * @param {number} segmentID - Camera segment ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<Array>} Array of log entries
 */
export async function getLogsBySegment(segmentID, startDate = null, endDate = null) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('segmentID');

    return new Promise((resolve, reject) => {
      const request = index.getAll(segmentID);

      request.onsuccess = () => {
        let results = request.result;

        // Filter by date range if provided
        if (startDate || endDate) {
          results = results.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            if (startDate && entryDate < startDate) return false;
            if (endDate && entryDate > endDate) return false;
            return true;
          });
        }

        db.close();
        resolve(results);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error fetching segment logs:', error);
    throw error;
  }
}

/**
 * Clean up old logs beyond retention period
 */
export async function cleanupOldLogs() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('timestamp');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS_RETENTION);

    const range = IDBKeyRange.upperBound(cutoffDate.toISOString());

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          db.close();
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    throw error;
  }
}

/**
 * Export logs to CSV format
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<string>} CSV formatted string
 */
export async function exportToCSV(startDate, endDate) {
  try {
    const logs = await getLogsByDateRange(startDate, endDate);

    if (logs.length === 0) {
      return 'No data available for the selected date range';
    }

    // CSV Header
    const headers = ['Timestamp', 'Date', 'SegmentID', 'Longitude', 'Latitude', 'Water Level', 'Light Level', 'Status'];
    const csvRows = [headers.join(',')];

    // CSV Data
    for (const log of logs) {
      const row = [
        log.timestamp,
        log.date,
        log.segmentID,
        log.position[0],
        log.position[1],
        log.water,
        log.light,
        log.status
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Filename for download
 */
export function downloadCSV(csvContent, filename = 'sewer-monitor-data.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Get aggregated data (hourly averages)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of hourly aggregated data
 */
export async function getHourlyAggregates(startDate, endDate) {
  try {
    const logs = await getLogsByDateRange(startDate, endDate);

    // Group by hour and segment
    const hourlyData = {};

    for (const log of logs) {
      const timestamp = new Date(log.timestamp);
      const hourKey = `${timestamp.toISOString().slice(0, 13)}:00:00_${log.segmentID}`;

      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = {
          timestamp: `${timestamp.toISOString().slice(0, 13)}:00:00`,
          segmentID: log.segmentID,
          waterLevels: [],
          lightLevels: [],
          position: log.position,
        };
      }

      hourlyData[hourKey].waterLevels.push(log.water);
      hourlyData[hourKey].lightLevels.push(log.light);
    }

    // Calculate averages
    return Object.values(hourlyData).map(hour => ({
      timestamp: hour.timestamp,
      segmentID: hour.segmentID,
      position: hour.position,
      avgWater: hour.waterLevels.reduce((a, b) => a + b, 0) / hour.waterLevels.length,
      avgLight: hour.lightLevels.reduce((a, b) => a + b, 0) / hour.lightLevels.length,
      minWater: Math.min(...hour.waterLevels),
      maxWater: Math.max(...hour.waterLevels),
      dataPoints: hour.waterLevels.length,
    }));
  } catch (error) {
    console.error('Error calculating hourly aggregates:', error);
    throw error;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Stats about stored data
 */
export async function getStorageStats() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const countRequest = objectStore.count();

      countRequest.onsuccess = () => {
        const totalRecords = countRequest.result;

        // Get date range
        const index = objectStore.index('timestamp');
        const getAllRequest = index.getAll();

        getAllRequest.onsuccess = () => {
          const records = getAllRequest.result;

          let oldestDate = null;
          let newestDate = null;

          if (records.length > 0) {
            oldestDate = new Date(records[0].timestamp);
            newestDate = new Date(records[records.length - 1].timestamp);
          }

          db.close();
          resolve({
            totalRecords,
            oldestDate,
            newestDate,
            estimatedSizeMB: (totalRecords * 0.0001).toFixed(2), // Rough estimate
          });
        };

        getAllRequest.onerror = () => {
          db.close();
          reject(getAllRequest.error);
        };
      };

      countRequest.onerror = () => {
        db.close();
        reject(countRequest.error);
      };
    });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw error;
  }
}
