/**
 * COMPREHENSIVE AI SYSTEM INTEGRATION TEST
 * =======================================
 * Tests all AI endpoints and functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test configurations
const testConfig = {
    timeout: 30000, // 30 second timeout for AI responses
    headers: {
        'Content-Type': 'application/json'
    }
};

async function testHealthEndpoint() {
    console.log('\n🏥 Testing Health Endpoint...');
    try {
        const response = await axios.get(`${BASE_URL}/healthz`, testConfig);
        console.log('✅ Health Check Status:', response.data.status);
        console.log('📊 Database Status:', response.data.database?.status);
        console.log('🔐 Auth Status:', response.data.authentication?.status);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

async function testAIStatusEndpoint() {
    console.log('\n🤖 Testing AI Status Endpoint...');
    try {
        // Note: This endpoint requires authentication, but let's test it anyway
        const response = await axios.get(`${BASE_URL}/api/ai/status`, testConfig);
        console.log('✅ AI Status Response:', response.data);
        return true;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('🔒 AI Status requires authentication (expected)');
            console.log('📋 Response:', error.response.data);
            return true; // This is expected behavior
        } else {
            console.error('❌ AI Status failed:', error.message);
            return false;
        }
    }
}

async function testDirectAIIntegration() {
    console.log('\n🧙‍♂️ Testing Direct AI Integration (Node.js ↔ Python)...');
    
    const { spawn } = require('child_process');
    const path = require('path');
    
    const aiAgentsPath = path.join(__dirname, 'ai-agents');
    
    return new Promise((resolve) => {
        const pythonProcess = spawn('python', [
            path.join(aiAgentsPath, 'restaurant_oracle.py'),
            '--query', 'What are 3 key metrics every restaurant should track?'
        ], { cwd: aiAgentsPath });

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(outputData);
                    console.log('✅ Direct AI Integration Success!');
                    console.log('🎯 Query Response Preview:', result.response.substring(0, 200) + '...');
                    console.log('🤖 Model Used:', result.model);
                    resolve(true);
                } catch (parseError) {
                    console.error('❌ Failed to parse AI response:', parseError.message);
                    resolve(false);
                }
            } else {
                console.error('❌ AI process failed with code:', code);
                console.error('Error:', errorData);
                resolve(false);
            }
        });
    });
}

async function testMultipleAIQueries() {
    console.log('\n🔮 Testing Multiple AI Consultation Types...');
    
    const queries = [
        'How can I reduce food waste in my restaurant?',
        'What are the best practices for peak hour staffing?',
        'How do I calculate optimal menu pricing?'
    ];
    
    const { spawn } = require('child_process');
    const path = require('path');
    
    for (let i = 0; i < queries.length; i++) {
        console.log(`\n📝 Query ${i + 1}: ${queries[i]}`);
        
        const result = await new Promise((resolve) => {
            const aiAgentsPath = path.join(__dirname, 'ai-agents');
            const pythonProcess = spawn('python', [
                path.join(aiAgentsPath, 'restaurant_oracle.py'),
                '--query', queries[i]
            ], { cwd: aiAgentsPath });

            let outputData = '';
            
            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(outputData);
                        console.log('✅ Response received (length:', result.response.length, 'chars)');
                        resolve(true);
                    } catch (error) {
                        console.error('❌ Parse error');
                        resolve(false);
                    }
                } else {
                    console.error('❌ Process failed');
                    resolve(false);
                }
            });
        });
        
        if (!result) {
            return false;
        }
    }
    
    return true;
}

async function runFullIntegrationTest() {
    console.log('🏰 ODIN\'S ALMANAC - FULL AI INTEGRATION TEST');
    console.log('=============================================');
    console.log('🎯 Testing complete AI system functionality\n');
    
    const results = {
        health: false,
        aiStatus: false,
        directIntegration: false,
        multipleQueries: false
    };
    
    // Test all components
    results.health = await testHealthEndpoint();
    results.aiStatus = await testAIStatusEndpoint();
    results.directIntegration = await testDirectAIIntegration();
    results.multipleQueries = await testMultipleAIQueries();
    
    // Results summary
    console.log('\n🏆 INTEGRATION TEST RESULTS');
    console.log('============================');
    console.log('🏥 Health Endpoint:', results.health ? '✅ PASS' : '❌ FAIL');
    console.log('🤖 AI Status:', results.aiStatus ? '✅ PASS' : '❌ FAIL');
    console.log('🔗 Direct Integration:', results.directIntegration ? '✅ PASS' : '❌ FAIL');
    console.log('🔮 Multiple Queries:', results.multipleQueries ? '✅ PASS' : '❌ FAIL');
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 ALL TESTS PASSED! YOUR AI SYSTEM IS FULLY OPERATIONAL! 🎉');
        console.log('⚔️ Odin\'s Oracle stands ready to serve restaurant intelligence!');
        console.log('🚀 Your AI-powered restaurant empire is ready for conquest!');
    } else {
        console.log('\n⚠️ Some tests need attention. See details above.');
    }
    
    return allPassed;
}

// Run the comprehensive test
runFullIntegrationTest()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('\n💀 Integration test crashed:', error.message);
        process.exit(1);
    });