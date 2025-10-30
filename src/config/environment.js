/**
 * Environment Configuration
 * Centralized configuration for all environment variables
 */

const environment = {
  // Environment type
  env: import.meta.env.VITE_ENVIRONMENT || 'development',
  isDevelopment: import.meta.env.VITE_ENVIRONMENT === 'development',
  isStaging: import.meta.env.VITE_ENVIRONMENT === 'staging',
  isProduction: import.meta.env.VITE_ENVIRONMENT === 'production',

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 30000,
    rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT) || 100,
    rateWindow: parseInt(import.meta.env.VITE_API_RATE_WINDOW) || 60000,
  },

  // WebSocket Configuration
  socket: {
    url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
    reconnectionAttempts: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_ATTEMPTS) || 5,
    reconnectionDelay: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY) || 3000,
    timeout: parseInt(import.meta.env.VITE_SOCKET_TIMEOUT) || 20000,
  },

  // Payment Gateway Configuration
  payments: {
    mpesa: {
      consumerKey: import.meta.env.VITE_MPESA_CONSUMER_KEY,
      consumerSecret: import.meta.env.VITE_MPESA_CONSUMER_SECRET,
      shortcode: import.meta.env.VITE_MPESA_SHORTCODE,
      passkey: import.meta.env.VITE_MPESA_PASSKEY,
      environment: import.meta.env.VITE_MPESA_ENVIRONMENT || 'sandbox',
    },
    airtel: {
      clientId: import.meta.env.VITE_AIRTEL_CLIENT_ID,
      clientSecret: import.meta.env.VITE_AIRTEL_CLIENT_SECRET,
      environment: import.meta.env.VITE_AIRTEL_ENVIRONMENT || 'test',
    },
    telkom: {
      apiKey: import.meta.env.VITE_TELKOM_API_KEY,
      merchantId: import.meta.env.VITE_TELKOM_MERCHANT_ID,
      environment: import.meta.env.VITE_TELKOM_ENVIRONMENT || 'test',
    },
    stripe: {
      publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    },
    flutterwave: {
      publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    },
    gateway: import.meta.env.VITE_PAYMENT_GATEWAY || 'stripe',
  },

  // File Storage Configuration
  storage: {
    url: import.meta.env.VITE_FILE_STORAGE_URL,
    region: import.meta.env.VITE_FILE_STORAGE_REGION || 'us-east-1',
    bucket: import.meta.env.VITE_FILE_STORAGE_BUCKET,
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  },

  // Monitoring and Error Tracking
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    replaysSessionSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE) || 0.1,
    replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE) || 1.0,
  },

  // Analytics
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Feature Flags
  features: {
    mockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    performanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
    serviceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  },

  // Security
  security: {
    httpsOnly: import.meta.env.VITE_ENABLE_HTTPS_ONLY === 'true',
    strictCSP: import.meta.env.VITE_ENABLE_STRICT_CSP === 'true',
  },

  // Cache Configuration
  cache: {
    version: import.meta.env.VITE_CACHE_VERSION || '1.0.0',
  },
};

// Validate required environment variables in production
if (environment.isProduction) {
  const requiredVars = [
    'VITE_API_URL',
    'VITE_SOCKET_URL',
    'VITE_SENTRY_DSN',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

export default environment;
