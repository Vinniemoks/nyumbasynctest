// Express.js CORS configuration example
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',  // React development server
    'http://localhost:5173',  // Vite development server
    'http://127.0.0.1:5500',  // Live Server extension
    'https://mokuavinnie.tech',  // Production frontend
    'https://your-staging-domain.com'    // Staging frontend
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// For development only, allow all origins
app.use(cors({
   origin: true,
  credentials: true
 }));