const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the './build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Proxy middleware for API requests
const target = process.env.WF_SERVER || 'http://localhost:8080';
app.use(
    '/api',
    createProxyMiddleware({
        target: target,
        // pathRewrite: { '^/api/': '/' }, // Uncomment this line if you want to rewrite paths
        changeOrigin: true,
    })
);

// Handling routes for SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
