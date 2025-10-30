#!/usr/bin/env node
/**
 * AI Integration Test - Node.js Bridge to Python AI
 * Tests the integration layer without requiring GitHub token
 */

const { spawn } = require('child_process');
const path = require('path');

class AIIntegrationTest {
    constructor() {
        this.aiAgentsPath = path.join(__dirname, '..', 'ai-agents');
        console.log('🏰 AI Integration Test Starting...');
    }

    /**
     * Test Python AI system availability
     */
    async testPythonAI() {
        console.log('\n🔧 Testing Python AI System...');
        
        return new Promise((resolve) => {
            // Create a simple test script
            const testScript = `
import sys
import os
ai_agents_path = os.path.join(os.getcwd(), '..', 'ai-agents')
sys.path.append(ai_agents_path)
os.chdir(ai_agents_path)
try:
    from restaurant_oracle import OdinsRestaurantConsultant
    oracle = OdinsRestaurantConsultant("test-token")
    print("✅ Python AI system ready")
    print(f"Model: {oracle.model_id}")
    print("✅ Integration bridge functional")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
`.trim();

            const python = spawn('python', ['-c', testScript], {
                cwd: __dirname,
                shell: true
            });

            let output = '';
            let errorOutput = '';
            
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0) {
                    console.log(output);
                    console.log('✅ Python AI system test passed');
                    resolve(true);
                } else {
                    console.log('❌ Python AI system test failed');
                    if (errorOutput) console.log('Error output:', errorOutput);
                    if (output) console.log('Standard output:', output);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Test AI consultant class structure
     */
    async testAIConsultant() {
        console.log('\n🎯 Testing AI Consultant Class...');
        
        try {
            // Import the AI consultant class
            const { OdinsAIConsultant } = require('./lib/ai/ai-consultant');
            console.log('✅ AI Consultant class imported');
            
            const consultant = new OdinsAIConsultant();
            console.log('✅ AI Consultant instance created');
            console.log('✅ Node.js integration layer ready');
            
            return true;
        } catch (error) {
            console.log(`❌ AI Consultant test failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Show available AI endpoints
     */
    showAIEndpoints() {
        console.log('\n🚀 AVAILABLE AI ENDPOINTS:');
        console.log('='*50);
        
        const endpoints = [
            'GET  /api/ai/status           - AI system health check',
            'POST /api/ai/consultation     - General AI consultation',
            'POST /api/ai/analyze/menu     - Menu performance analysis',
            'POST /api/ai/predict/inventory - Inventory forecasting', 
            'POST /api/ai/analyze/sales    - Sales trend analysis',
            'POST /api/ai/insights/business - Business strategy insights',
            'POST /api/ai/forecast/revenue - Revenue prediction'
        ];
        
        endpoints.forEach((endpoint, i) => {
            console.log(`  ${i + 1}. ${endpoint}`);
        });
    }

    /**
     * Show authentication requirements
     */
    showAuthRequirements() {
        console.log('\n🛡️ AUTHENTICATION REQUIREMENTS:');
        console.log('='*50);
        
        const roles = [
            '👥 Thrall (Basic User):    Read-only AI insights',
            '⚔️ Huskarl (Manager):     Full AI consultation access',
            '🏰 Hirdman (Owner):       Advanced analytics + predictions', 
            '👑 Jarl (Admin):          Complete system access + config'
        ];
        
        roles.forEach(role => {
            console.log(`  ${role}`);
        });
    }

    /**
     * Run comprehensive test
     */
    async runTest() {
        console.log('🏰 ODIN\'S AI INTEGRATION TEST');
        console.log('='*60);
        
        // Test Python AI
        const pythonOK = await this.testPythonAI();
        
        // Test Node.js integration
        const nodeOK = await this.testAIConsultant();
        
        // Show endpoints
        this.showAIEndpoints();
        
        // Show auth requirements
        this.showAuthRequirements();
        
        // Final status
        console.log('\n🏆 INTEGRATION TEST RESULTS:');
        console.log('='*50);
        console.log(`✅ Python AI Backend:  ${pythonOK ? 'READY' : 'FAILED'}`);
        console.log(`✅ Node.js Bridge:     ${nodeOK ? 'READY' : 'FAILED'}`);
        console.log(`🔑 GitHub Token:       NEEDED`);
        console.log(`⚔️ Integration Status: ${pythonOK && nodeOK ? 'READY FOR TOKEN' : 'NEEDS FIXING'}`);
        
        if (pythonOK && nodeOK) {
            console.log('\n🎉 AI integration layer is ready for GitHub token activation!');
            console.log('🔑 Add your GitHub token to .env to activate full AI capabilities.');
        } else {
            console.log('\n❌ Please fix the issues above before proceeding.');
        }
    }
}

// Run the test
const tester = new AIIntegrationTest();
tester.runTest().catch(console.error);