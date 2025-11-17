// Express.js CORS configuration for production
const cors = require('cors');

// Production CORS configuration
const productionCorsOptions = {
  origin: [
    'https://mokuavinnie.tech',  // Production frontend
    'https://www.mokuavinnie.tech',  // Production frontend with www
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// Staging CORS configuration
const stagingCorsOptions = {
  origin: [
    'https://staging.mokuavinnie.tech',
    'https://your-staging-domain.com',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400,
};

// Development CORS configuration
const developmentCorsOptions = {
  origin: [
    'http://localhost:3000',  // React development server
    'http://localhost:5173',  // Vite development server
    'http://localhost:5000',  // Alternative Vite port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

// Select configuration based on environment
const getCorsOptions = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionCorsOptions;
    case 'staging':
      return stagingCorsOptions;
    case 'development':
    default:
      return developmentCorsOptions;
  }
};

// Usage in Express app
// app.use(cors(getCorsOptions()));

// Export for use in your backend
module.exports = {
  productionCorsOptions,
  stagingCorsOptions,
  developmentCorsOptions,
  getCorsOptions,
};

// SECURITY NOTE:
// - NEVER use origin: true in production
// - Always specify exact origins
// - Use HTTPS in production
// - Enable credentials only if needed
// - Validate origin on the server side
