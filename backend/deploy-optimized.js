#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Optimized SkilledLink Backend...\n');

// Check if optimized controller exists
const optimizedControllerPath = path.join(__dirname, 'controllers', 'optimizedAuthController.js');
const currentControllerPath = path.join(__dirname, 'controllers', 'authController.js');
const backupControllerPath = path.join(__dirname, 'controllers', 'authController.js.backup');

if (!fs.existsSync(optimizedControllerPath)) {
  console.error('❌ Optimized controller not found. Please ensure optimizedAuthController.js exists.');
  process.exit(1);
}

try {
  // Create backup of current controller
  if (fs.existsSync(currentControllerPath)) {
    fs.copyFileSync(currentControllerPath, backupControllerPath);
    console.log('✅ Backup created: authController.js.backup');
  }

  // Replace with optimized version
  fs.copyFileSync(optimizedControllerPath, currentControllerPath);
  console.log('✅ Optimized auth controller deployed');

  // Check if required files exist
  const requiredFiles = [
    'utils/envValidator.js',
    'utils/asyncEmailService.js',
    'routes/monitoringRoutes.js'
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log('\n⚠️  Some required files are missing. Please ensure all optimization files are in place.');
    process.exit(1);
  }

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your environment variables (see PRODUCTION_DEPLOYMENT_GUIDE.md)');
  console.log('2. Restart your server: npm start');
  console.log('3. Test the endpoints: curl http://localhost:5000/api/monitoring/health');
  console.log('4. Monitor email queue: curl http://localhost:5000/api/monitoring/email-queue');
  
  console.log('\n🔍 To rollback if needed:');
  console.log('cp controllers/authController.js.backup controllers/authController.js');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
