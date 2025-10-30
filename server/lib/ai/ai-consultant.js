/**
 * ODIN'S ALMANAC - AI INTEGRATION LAYER ⚔️
 * ==========================================
 * 
 * This module provides the Node.js integration layer for the Python AI agents.
 * It handles communication between the Express server and the AI restaurant
 * consultant system, providing a seamless interface for AI-powered insights.
 * 
 * Features:
 * - 🤖 AI Restaurant Consultation API
 * - 📊 Menu Performance Analysis
 * - 🔮 Inventory Forecasting
 * - 📈 Sales Trend Analysis  
 * - 💡 Business Strategy Recommendations
 * - 🎯 Revenue Optimization Insights
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

class OdinsAIConsultant {
    constructor() {
        this.aiAgentsPath = path.join(__dirname, '../../ai-agents');
        this.pythonScriptPath = path.join(this.aiAgentsPath, 'restaurant_oracle.py');
        this.isInitialized = false;
    }

    /**
     * Initialize the AI system
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            // Check if Python environment is set up
            if (!fs.existsSync(this.pythonScriptPath)) {
                throw new Error('AI agent script not found');
            }

            // Verify GitHub token is available
            if (!process.env.GITHUB_TOKEN) {
                console.warn('⚠️ GITHUB_TOKEN not set. AI features will be limited.');
                return false;
            }

            this.isInitialized = true;
            console.log('🏰 Odin\'s AI Consultant initialized successfully!');
            return true;

        } catch (error) {
            console.error('💀 Failed to initialize AI Consultant:', error.message);
            return false;
        }
    }

    /**
     * Execute AI consultation using Python agent
     * @param {string} query - The consultation query
     * @param {Object} restaurantContext - Restaurant context data
     * @returns {Promise<string>} AI consultation response
     */
    async getAIConsultation(query, restaurantContext = null) {
        if (!this.isInitialized) {
            return {
                success: false,
                error: 'AI Consultant not initialized. Please check configuration.'
            };
        }

        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [
                this.pythonScriptPath,
                '--query', query,
                '--context', JSON.stringify(restaurantContext || {})
            ]);

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
                        resolve({
                            success: true,
                            consultation: result.response,
                            timestamp: new Date().toISOString(),
                            model_used: result.model || 'gpt-4.1'
                        });
                    } catch (parseError) {
                        resolve({
                            success: true,
                            consultation: outputData.trim(),
                            timestamp: new Date().toISOString(),
                            model_used: 'gpt-4.1'
                        });
                    }
                } else {
                    reject({
                        success: false,
                        error: `AI process failed with code ${code}: ${errorData}`,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Handle process errors
            pythonProcess.on('error', (error) => {
                reject({
                    success: false,
                    error: `Failed to start AI process: ${error.message}`,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Analyze menu performance using AI
     * @param {Array} menuItems - Array of menu items with pricing and costs
     * @param {Array} salesData - Array of sales data
     * @returns {Promise<Object>} Menu analysis results
     */
    async analyzeMenuPerformance(menuItems, salesData) {
        const query = `Analyze menu performance for optimization opportunities`;
        const context = {
            analysis_type: 'menu_performance',
            menu_data: menuItems,
            sales_data: salesData
        };

        try {
            const result = await this.getAIConsultation(query, context);
            return {
                ...result,
                analysis_type: 'menu_performance',
                recommendations: this._extractRecommendations(result.consultation)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Menu analysis failed',
                details: error.message
            };
        }
    }

    /**
     * Predict inventory needs using AI
     * @param {Array} inventoryData - Current inventory data
     * @param {Object} forecastParams - Forecasting parameters
     * @returns {Promise<Object>} Inventory predictions
     */
    async predictInventoryNeeds(inventoryData, forecastParams = {}) {
        const query = `Predict inventory needs for the next week`;
        const context = {
            analysis_type: 'inventory_forecast',
            inventory_data: inventoryData,
            forecast_params: forecastParams
        };

        try {
            const result = await this.getAIConsultation(query, context);
            return {
                ...result,
                analysis_type: 'inventory_forecast',
                urgent_items: this._extractUrgentItems(result.consultation),
                predictions: this._extractInventoryPredictions(result.consultation)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Inventory prediction failed',
                details: error.message
            };
        }
    }

    /**
     * Analyze sales trends using AI
     * @param {Array} salesHistory - Historical sales data
     * @param {string} timePeriod - Analysis time period
     * @returns {Promise<Object>} Sales trend analysis
     */
    async analyzeSalesTrends(salesHistory, timePeriod = '30_days') {
        const query = `Analyze sales trends and identify patterns`;
        const context = {
            analysis_type: 'sales_trends',
            sales_history: salesHistory,
            time_period: timePeriod
        };

        try {
            const result = await this.getAIConsultation(query, context);
            return {
                ...result,
                analysis_type: 'sales_trends',
                key_insights: this._extractKeyInsights(result.consultation),
                growth_metrics: this._extractGrowthMetrics(result.consultation)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Sales trend analysis failed',
                details: error.message
            };
        }
    }

    /**
     * Generate comprehensive business insights
     * @param {Object} restaurantData - Complete restaurant data
     * @returns {Promise<Object>} Business insights and recommendations
     */
    async generateBusinessInsights(restaurantData) {
        const query = `Provide comprehensive business insights and strategic recommendations`;
        const context = {
            analysis_type: 'business_insights',
            restaurant_data: restaurantData
        };

        try {
            const result = await this.getAIConsultation(query, context);
            return {
                ...result,
                analysis_type: 'business_insights',
                strategic_recommendations: this._extractStrategicRecommendations(result.consultation),
                priority_actions: this._extractPriorityActions(result.consultation)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Business insights generation failed',
                details: error.message
            };
        }
    }

    /**
     * Forecast revenue using AI
     * @param {Array} historicalData - Historical revenue data
     * @param {Object} forecastParams - Forecasting parameters
     * @returns {Promise<Object>} Revenue forecast
     */
    async forecastRevenue(historicalData, forecastParams = {}) {
        const query = `Forecast revenue for the next 30 days`;
        const context = {
            analysis_type: 'revenue_forecast',
            historical_data: historicalData,
            forecast_params: forecastParams
        };

        try {
            const result = await this.getAIConsultation(query, context);
            return {
                ...result,
                analysis_type: 'revenue_forecast',
                forecast_range: this._extractForecastRange(result.consultation),
                confidence_level: this._extractConfidenceLevel(result.consultation)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Revenue forecasting failed',
                details: error.message
            };
        }
    }

    /**
     * Get interactive AI consultation
     * @param {string} question - Business question
     * @param {Object} restaurantContext - Restaurant context
     * @returns {Promise<Object>} AI consultation response
     */
    async getInteractiveConsultation(question, restaurantContext) {
        try {
            const result = await this.getAIConsultation(question, restaurantContext);
            return {
                ...result,
                consultation_type: 'interactive',
                question: question,
                context_used: !!restaurantContext
            };
        } catch (error) {
            return {
                success: false,
                error: 'Interactive consultation failed',
                details: error.message
            };
        }
    }

    // Helper methods for extracting specific information from AI responses

    _extractRecommendations(consultation) {
        // Extract recommendations from AI response
        const lines = consultation.split('\n');
        return lines
            .filter(line => line.includes('•') || line.includes('-'))
            .map(line => line.trim())
            .slice(0, 5); // Top 5 recommendations
    }

    _extractUrgentItems(consultation) {
        // Extract urgent items from inventory consultation
        const urgentMatch = consultation.match(/URGENT RESTOCKING NEEDED:([\s\S]*?)(?=\n\n|\n📊|$)/);
        if (urgentMatch) {
            return urgentMatch[1]
                .split('\n')
                .filter(line => line.includes('•'))
                .map(line => line.trim());
        }
        return [];
    }

    _extractInventoryPredictions(consultation) {
        // Extract inventory predictions from consultation
        const predictionsMatch = consultation.match(/FULL INVENTORY PREDICTIONS[\s\S]*?:([\s\S]*?)(?=\n\n|\n🎯|$)/);
        if (predictionsMatch) {
            return predictionsMatch[1]
                .split('\n')
                .filter(line => line.includes('•'))
                .map(line => line.trim())
                .slice(0, 10); // Top 10 predictions
        }
        return [];
    }

    _extractKeyInsights(consultation) {
        // Extract key insights from sales analysis
        const insightsMatch = consultation.match(/STRATEGIC INSIGHTS:([\s\S]*?)(?=\n\n|$)/);
        if (insightsMatch) {
            return insightsMatch[1]
                .split('\n')
                .filter(line => line.includes('•'))
                .map(line => line.trim());
        }
        return [];
    }

    _extractGrowthMetrics(consultation) {
        // Extract growth metrics from sales analysis
        const metrics = {};
        
        const growthMatch = consultation.match(/Growth Rate:\s*([+-]?\d+\.?\d*)%/);
        if (growthMatch) {
            metrics.growth_rate = parseFloat(growthMatch[1]);
        }

        const revenueMatch = consultation.match(/Average Daily Revenue:\s*\$([0-9,]+\.?\d*)/);
        if (revenueMatch) {
            metrics.avg_daily_revenue = parseFloat(revenueMatch[1].replace(/,/g, ''));
        }

        return metrics;
    }

    _extractStrategicRecommendations(consultation) {
        // Extract strategic recommendations from business insights
        const recMatch = consultation.match(/ACTIONABLE RECOMMENDATIONS:([\s\S]*?)(?=\n\n|\n🔮|$)/);
        if (recMatch) {
            return recMatch[1]
                .split('\n')
                .filter(line => line.match(/^\d+\./))
                .map(line => line.trim());
        }
        return [];
    }

    _extractPriorityActions(consultation) {
        // Extract priority actions from business insights
        const priorityMatch = consultation.match(/KEY STRATEGIC OPPORTUNITIES:([\s\S]*?)(?=\n\n|\n💡|$)/);
        if (priorityMatch) {
            return priorityMatch[1]
                .split('\n')
                .filter(line => line.includes('•'))
                .map(line => line.trim());
        }
        return [];
    }

    _extractForecastRange(consultation) {
        // Extract forecast range from revenue forecast
        const rangeMatch = consultation.match(/Expected Revenue Range:\s*\$([0-9,]+)\s*-\s*\$([0-9,]+)/);
        if (rangeMatch) {
            return {
                min: parseInt(rangeMatch[1].replace(/,/g, '')),
                max: parseInt(rangeMatch[2].replace(/,/g, ''))
            };
        }
        return null;
    }

    _extractConfidenceLevel(consultation) {
        // Extract confidence level from forecast
        const confidenceMatch = consultation.match(/Confidence Level:\s*(\d+)%/);
        if (confidenceMatch) {
            return parseInt(confidenceMatch[1]);
        }
        return null;
    }
}

// Export the AI consultant
module.exports = {
    OdinsAIConsultant
};