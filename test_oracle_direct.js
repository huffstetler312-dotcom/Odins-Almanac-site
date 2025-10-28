/**
 * Direct Oracle Test - Bypass Authentication
 * Test the AI Oracle directly without server authentication
 */

const { spawn } = require('child_process');
const path = require('path');

async function testOracleDirectly() {
    console.log('🏰 TESTING ODIN\'S ORACLE DIRECTLY');
    console.log('==================================');
    
    const aiAgentsPath = path.join(__dirname, 'ai-agents');
    const pythonScript = path.join(aiAgentsPath, 'restaurant_oracle.py');
    
    console.log(`📍 AI Agents Path: ${aiAgentsPath}`);
    console.log(`📍 Python Script: ${pythonScript}`);
    
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            pythonScript,
            '--query', 'Give me 3 quick tips for restaurant profitability'
        ], {
            cwd: aiAgentsPath
        });

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
                    console.log('✅ AI Oracle Response:');
                    console.log('Success:', result.success);
                    console.log('Model:', result.model);
                    console.log('Timestamp:', result.timestamp);
                    console.log('\n🧙‍♂️ Oracle\'s Wisdom:');
                    console.log(result.response);
                    resolve(result);
                } catch (parseError) {
                    console.error('❌ Failed to parse Oracle response:', parseError.message);
                    console.log('Raw output:', outputData);
                    reject(parseError);
                }
            } else {
                console.error('❌ Oracle process failed with code:', code);
                console.error('Error output:', errorData);
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
}

// Run the test
testOracleDirectly()
    .then(() => {
        console.log('\n🎉 ORACLE TEST COMPLETED SUCCESSFULLY!');
        console.log('⚔️ Your AI system is fully operational!');
    })
    .catch((error) => {
        console.error('\n💀 Oracle test failed:', error.message);
    });