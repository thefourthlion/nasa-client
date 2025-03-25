const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

// NASA APOD API key
const apiKey = ' ';

// Cache file to store already processed dates
const CACHE_FILE = path.join(__dirname, 'processed_dates.json');

// Create axios instances with keepAlive connections
const nasaApi = axios.create({
  baseURL: 'https://api.nasa.gov',
  timeout: 10000,
  headers: {'Connection': 'keep-alive'},
  httpAgent: new (require('http').Agent)({ keepAlive: true }),
  httpsAgent: new (require('https').Agent)({ keepAlive: true })
});

const localApi = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 5000,
  headers: {'Connection': 'keep-alive'},
  httpAgent: new (require('http').Agent)({ keepAlive: true }),
  httpsAgent: new (require('https').Agent)({ keepAlive: true })
});

// Set up a date cache to avoid redundant API calls
let processedDates = new Set();

// Load cache from file if exists
async function loadProcessedDatesCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    processedDates = new Set(JSON.parse(data));
    console.log(`Loaded ${processedDates.size} processed dates from cache`);
  } catch (error) {
    console.log('No cache file found or error reading cache, starting fresh');
    processedDates = new Set();
  }
}

// Save cache to file
async function saveProcessedDatesCache() {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify([...processedDates]), 'utf8');
    console.log(`Saved ${processedDates.size} processed dates to cache`);
  } catch (error) {
    console.error('Error saving cache:', error.message);
  }
}

// Function to generate dates
function getPreviousDate(date, daysBack) {
  const result = new Date(date);
  result.setDate(result.getDate() - daysBack);
  return result.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

// Helper function to pause execution
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to check if a date already exists in your local API
async function checkIfDateExists(date) {
  // First check cache
  if (processedDates.has(date)) {
    return true;
  }
  
  try {
    const response = await localApi.get(`/api/apod/date/${date}`);
    if (response.status === 200) {
      processedDates.add(date); // Add to in-memory cache
      return true;
    }
    return false;
  } catch (error) {
    // If we get a 404, the date doesn't exist in our database
    if (error.response && error.response.status === 404) {
      return false;
    }
    // For connection errors, assume not found but don't fail
    console.error(`Error checking if date ${date} exists:`, error.message);
    return false;
  }
}

// Process dates until we can't find any more data
async function processUnlimitedDates(startDate = '2025-03-24', concurrentRequests = 10) {
  console.time('Total execution time');
  
  // Load cache first
  await loadProcessedDatesCache();
  
  // Variables to track progress
  let currentDay = 0;
  let processedCount = 0;
  let batchSuccesses = 0;
  const batchSize = 100; // Save cache after processing this many dates
  
  console.log(`Starting unlimited scraping from ${startDate} going backwards in time`);
  console.log(`This will continue indefinitely. Press Ctrl+C to stop manually.`);
  
  // Continue processing forever
  while (true) {
    // Generate the next batch of dates to process
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(getPreviousDate(startDate, currentDay + i));
    }
    
    const oldestDateInBatch = batch[batch.length - 1];
    console.log(`Processing batch starting at ${batch[0]} through ${oldestDateInBatch} (days ${currentDay}-${currentDay + batchSize - 1})`);
    
    // Reset batch success counter
    batchSuccesses = 0;
    
    // Process each batch in smaller concurrent chunks
    for (let j = 0; j < batch.length; j += concurrentRequests) {
      const chunk = batch.slice(j, j + concurrentRequests);
      
      // Use Promise.all for concurrency but track individual results
      const results = await Promise.allSettled(
        chunk.map(date => processDateWithResult(date))
      );
      
      // Count successes and failures
      const successes = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      batchSuccesses += successes;
      
      // Brief pause between chunks to avoid overwhelming servers
      if (j + concurrentRequests < batch.length) {
        await sleep(100);
      }
    }
    
    // Update progress
    processedCount += batchSuccesses;
    currentDay += batchSize;
    
    // Log batch results
    if (batchSuccesses > 0) {
      console.log(`Batch complete: ✅ ${batchSuccesses}/${batchSize} dates processed successfully`);
    } else {
      console.log(`Batch complete: ⚠️ No successful entries in this batch (${oldestDateInBatch} to ${batch[0]})`);
      console.log(`Continuing to next batch regardless...`);
    }
    
    console.log(`Total progress: ${processedCount} dates processed, now at ${getPreviousDate(startDate, currentDay)}`);
    
    // Estimate dates until start of NASA APOD (June 16, 1995)
    const nasaApodStartDate = new Date('1995-06-16');
    const currentDate = new Date(getPreviousDate(startDate, currentDay));
    const daysRemaining = Math.max(0, Math.floor((currentDate - nasaApodStartDate) / (1000 * 60 * 60 * 24)));
    
    if (daysRemaining > 0) {
      console.log(`Approximately ${daysRemaining} days remaining until reaching NASA APOD's beginning (1995-06-16)`);
    } else if (currentDate <= nasaApodStartDate) {
      console.log(`We've gone past NASA APOD's beginning (1995-06-16), but continuing anyway...`);
    }
    
    // Save cache after each batch
    await saveProcessedDatesCache();
    
    // Optional: Add a small break between batches to give the system a rest
    console.log(`Taking a short break before the next batch...`);
    await sleep(1000);
  }
}

// Helper function that returns true if the date was successfully processed
async function processDateWithResult(date) {
  try {
    // Skip if already in cache
    if (processedDates.has(date)) {
      return false; // Already processed, not a new success
    }
    
    // Check if date exists in database
    const exists = await checkIfDateExists(date);
    if (exists) {
      return false; // Already exists, not a new success
    }
    
    // Try to fetch and store the data
    const success = await fetchAndStoreApodData(date);
    return success; // Return true if we successfully processed a new date
  } catch (error) {
    console.error(`Error processing ${date}:`, error.message);
    return false;
  }
}

// Modified function to return success status
async function fetchAndStoreApodData(date, retryDelay = 2000, maxRetries = 3) {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      console.log(`Fetching data for ${date} from NASA API...`);
      
      // Step 1: Fetch data from NASA APOD API
      const response = await nasaApi.get(`/planetary/apod?date=${date}&api_key=${apiKey}`);
      const apodData = response.data;
      
      // Add copyright field if missing
      if (!apodData.copyright) {
        apodData.copyright = 'NASA';
      }
      
      // Check for other required fields
      const requiredFields = ['date', 'explanation', 'hdurl', 'media_type', 'service_version', 'title', 'url'];
      const missingFields = requiredFields.filter(field => !apodData[field]);
      
      if (missingFields.length > 0) {
        console.warn(`Skipping ${date}: Missing required fields: ${missingFields.join(', ')}`);
        return false;
      }

      // Step 2: Post data to local API
      await localApi.post('/api/apod/create', apodData);
      console.log(`✅ ${date} saved`);
      
      // Add to processed dates cache
      processedDates.add(date);
      
      return true; // Success
    } catch (error) {
      if (error.response) {
        if (error.response.status === 429) {
          retries++;
          const waitTime = retryDelay * Math.pow(2, retries - 1); // Exponential backoff
          console.log(`Rate limit hit for ${date}. Retry ${retries}/${maxRetries} after ${waitTime/1000}s...`);
          
          if (retries <= maxRetries) {
            await sleep(waitTime);
            continue;
          }
        } else if (error.response.status === 404) {
          // 404 means this date doesn't exist in NASA's API
          console.log(`No data exists for ${date} (404 Not Found)`);
          // Add to cache so we don't try again
          processedDates.add(date);
          return false;
        } else if (error.response.status >= 400) {
          console.log(`Error for ${date}: ${error.message} (${error.response.status})`);
          return false;
        }
      }
      console.error(`Error for ${date}:`, error.message);
      return false;
    }
  }
  return false;
}

// Helper function to validate date format (YYYY-MM-DD)
function isValidDateFormat(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && 
         date.toISOString().slice(0, 10) === dateString;
}

// Get starting date from command line or use default
function getStartDate() {
  // Default start date
  const DEFAULT_DATE = '1999-07-27';
  
  // Check if we have a command line argument
  const providedDate = process.argv[2];
  
  if (providedDate) {
    if (isValidDateFormat(providedDate)) {
      console.log(`Using provided start date: ${providedDate}`);
      return providedDate;
    } else {
      console.log(`Invalid date format: ${providedDate}. Expected format: YYYY-MM-DD`);
      console.log(`Falling back to default date: ${DEFAULT_DATE}`);
    }
  } else {
    console.log(`No start date provided. Using default: ${DEFAULT_DATE}`);
  }
  
  return DEFAULT_DATE;
}

// Main function
async function main() {
  try {
    // Get start date from command line or use default
    const startDate = getStartDate();
    
    // Start processing with unlimited dates
    await processUnlimitedDates(startDate, 10);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main();