/**
 * Environment Variables Checker
 * Validates that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for production
const REQUIRED_PRODUCTION_VARS = [
  'VITE_API_URL',
  'VITE_SOCKET_URL',
  'VITE_ENVIRONMENT',
  'VITE_SENTRY_DSN',
];

// Required payment gateway variables
const PAYMENT_VARS = {
  mpesa: [
    'VITE_MPESA_CONSUMER_KEY',
    'VITE_MPESA_CONSUMER_SECRET',
    'VITE_MPESA_SHORTCODE',
    'VITE_MPESA_PASSKEY',
  ],
  stripe: ['VITE_STRIPE_PUBLIC_KEY'],
  flutterwave: ['VITE_FLUTTERWAVE_PUBLIC_KEY'],
};

// Required storage variables
const STORAGE_VARS = [
  'VITE_FILE_STORAGE_URL',
  'VITE_CLOUDINARY_CLOUD_NAME',
];

function loadEnvFile(envFile) {
  const envPath = path.join(process.cwd(), envFile);
  
  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach((line) => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

function checkEnvironment(envFile, requiredVars) {
  console.log(`\n🔍 Checking ${envFile}...`);
  
  const envVars = loadEnvFile(envFile);
  
  if (!envVars) {
    console.log(`❌ ${envFile} not found`);
    return false;
  }

  const missing = [];
  const placeholder = [];

  requiredVars.forEach((varName) => {
    const value = envVars[varName];
    
    if (!value) {
      missing.push(varName);
    } else if (
      value.includes('your-') ||
      value.includes('XXXXXXXXXX') ||
      value === 'true' ||
      value === 'false'
    ) {
      // Check if it's a placeholder value
      if (varName.includes('KEY') || varName.includes('SECRET') || varName.includes('DSN')) {
        placeholder.push(varName);
      }
    }
  });

  if (missing.length > 0) {
    console.log(`❌ Missing variables:`);
    missing.forEach((varName) => console.log(`   - ${varName}`));
  }

  if (placeholder.length > 0) {
    console.log(`⚠️  Placeholder values detected:`);
    placeholder.forEach((varName) => console.log(`   - ${varName}`));
  }

  if (missing.length === 0 && placeholder.length === 0) {
    console.log(`✅ All required variables are set`);
    return true;
  }

  return false;
}

function main() {
  console.log('🚀 NyumbaSync Environment Configuration Checker\n');
  console.log('='.repeat(50));

  // Check .env.example
  console.log('\n📋 Checking .env.example (template)...');
  const exampleVars = loadEnvFile('.env.example');
  if (exampleVars) {
    console.log(`✅ Found ${Object.keys(exampleVars).length} variables in template`);
  }

  // Check production environment
  const productionValid = checkEnvironment(
    '.env.production',
    [...REQUIRED_PRODUCTION_VARS, ...STORAGE_VARS]
  );

  // Check staging environment
  const stagingValid = checkEnvironment(
    '.env.staging',
    [...REQUIRED_PRODUCTION_VARS, ...STORAGE_VARS]
  );

  // Check payment gateway configuration
  console.log('\n💳 Checking Payment Gateway Configuration...');
  const productionEnv = loadEnvFile('.env.production');
  
  if (productionEnv) {
    let hasPaymentGateway = false;

    Object.entries(PAYMENT_VARS).forEach(([gateway, vars]) => {
      const allSet = vars.every((varName) => {
        const value = productionEnv[varName];
        return value && !value.includes('your-');
      });

      if (allSet) {
        console.log(`✅ ${gateway.toUpperCase()} configured`);
        hasPaymentGateway = true;
      } else {
        console.log(`⚠️  ${gateway.toUpperCase()} not fully configured`);
      }
    });

    if (!hasPaymentGateway) {
      console.log('❌ No payment gateway fully configured!');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:');
  
  if (productionValid) {
    console.log('✅ Production environment ready');
  } else {
    console.log('❌ Production environment needs configuration');
  }

  if (stagingValid) {
    console.log('✅ Staging environment ready');
  } else {
    console.log('⚠️  Staging environment needs configuration');
  }

  console.log('\n📖 For detailed setup instructions, see:');
  console.log('   DEPLOYMENT_CONFIGURATION.md');
  console.log('\n');

  // Exit with error if production is not valid
  if (!productionValid) {
    process.exit(1);
  }
}

main();
