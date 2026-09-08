// Test script to verify admin authentication
const axios = require('axios');

const API_BASE_URL = 'https://api.InternKatta.gradezy.in';

async function testAuth() {
    try {
        // Test 1: Check if we can access the API
        console.log('Testing API connectivity...');
        const healthCheck = await axios.get(`${API_BASE_URL}/api/categories`);
        console.log('✅ API is accessible');
        
        // Test 2: Check admin authentication
        console.log('\nTesting admin authentication...');
        
        // Get admin token from localStorage (you'll need to copy this manually)
        const adminToken = process.env.ADMIN_TOKEN || 'your-admin-token-here';
        
        if (adminToken === 'your-admin-token-here') {
            console.log('❌ Please set ADMIN_TOKEN environment variable or update the script');
            return;
        }
        
        const authResponse = await axios.get(`${API_BASE_URL}/api/courses`, {
            headers: {
                'admin-authorization': `Bearer ${adminToken}`,
                'authorization': `Bearer ${adminToken}`
            }
        });
        
        console.log('✅ Admin authentication successful');
        console.log('Response status:', authResponse.status);
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.status, error.response?.data);
    }
}

testAuth();
