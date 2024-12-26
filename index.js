require('dotenv').config(); // Load environment variables from .env file

// Import required modules
const express = require('express');
const path = require('path');
const connectDB = require('./db/connection');
const Topic = require('./models/Topic');
const { scrapeTrendingTopics } = require('./utility/scraper');
const axios = require('axios');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Proxy middleware to rotate IP using ProxyMesh
const proxyMiddleware = async (req, res, next) => {
  // Set the ProxyMesh URL
  const proxyUrl = `http://${process.env.PROXYMESH_USERNAME}:${process.env.PROXYMESH_PASSWORD}@proxy.proxymesh.com:31280`;

  // Set the proxy for axios
  axios.defaults.proxy = {
    host: 'in.proxymesh.com',
    port: 31280,
    auth: {
      username: process.env.PROXYMESH_USERNAME,
      password: process.env.PROXYMESH_PASSWORD
    }
  };

  // Call the next middleware
  next();
};

// Use the proxy middleware
app.use(proxyMiddleware);

// API route to get trending topics
app.get('/api/trending-topics', async (req, res) => {

  var ip="192.12.77.1"
  try {
    const response = await axios.get('http://httpbin.org/ip');
    ip=response.data.origin
  } catch (error) {
    console.error('Error testing proxymesh:', error.message);
    res.status(500).json({ error: 'Failed to connect through proxy' });
  }
  const authToken = process.env.TWITTER_AUTH_TOKEN;
  try {
    const trendingTopics = await scrapeTrendingTopics(authToken);

    // Ensure we only take the top 5 topics
    const twitter_scrap_data = {
      nameoftrend1: trendingTopics[0] || null,
      nameoftrend2: trendingTopics[1] || null,
      nameoftrend3: trendingTopics[2] || null,
      nameoftrend4: trendingTopics[3] || null,
      nameoftrend5: trendingTopics[4] || null,
      timestamp: new Date().toISOString(), // Add current timestamp
      ip:ip
    };

    // Save trending topics to MongoDB
    const newTopic = new Topic(twitter_scrap_data);
    await newTopic.save();
    console.log(newTopic)

    res.json({ response_data:newTopic });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending topics' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Express Server!');
});

// 404 Route
app.use((req, res) => {
  res.status(404).send('Page not found!');
});

// Start the server and connect to MongoDB
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await connectDB(); // Connect to MongoDB
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
});