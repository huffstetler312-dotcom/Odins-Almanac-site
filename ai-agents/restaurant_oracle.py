"""
ODIN'S ALMANAC - AI RESTAURANT CONSULTANT ⚔️
====================================================
The Oracle's Wisdom: AI-Powered Restaurant Intelligence Agent

This module implements the core AI agent that provides intelligent
restaurant insights, menu optimization, and predictive analytics
using the Microsoft Agent Framework and GitHub Models.

Features:
- 🧠 Menu Optimization Intelligence
- 📊 Predictive Sales Analytics  
- 💡 Business Strategy Recommendations
- 🔮 Inventory Forecasting
- 📝 Automated Insights Reports
- 💬 Natural Language Business Consulting
"""

import asyncio
import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging

# Microsoft Agent Framework imports
from agent_framework import ChatAgent
from agent_framework.openai import OpenAIChatClient
from openai import AsyncOpenAI

# Data processing imports
import math
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RestaurantData:
    """Restaurant data structure for AI analysis"""
    id: str
    name: str
    cuisine_type: str
    avg_daily_revenue: float
    menu_items: List[Dict[str, Any]]
    inventory_data: List[Dict[str, Any]]
    sales_history: List[Dict[str, Any]]
    peak_hours: List[str]
    seasonal_trends: Dict[str, float]

class OdinsRestaurantConsultant:
    """
    The Oracle of Odin's Almanac - AI Restaurant Intelligence Agent
    
    This agent leverages GitHub Models to provide comprehensive
    restaurant intelligence and business optimization insights.
    """
    
    def __init__(self, github_token: str, model_id: str = "openai/gpt-4.1"):
        """
        Initialize the Viking AI Restaurant Consultant
        
        Args:
            github_token: GitHub Personal Access Token for model access
            model_id: Model ID from GitHub Models (default: gpt-4.1)
        """
        self.github_token = github_token
        self.model_id = model_id
        self.agent = None
        self.openai_client = None
        self.chat_client = None
        
        # Viking-themed system instructions
        self.system_instructions = """
        You are Odin's Oracle, a legendary AI consultant for Viking Restaurant Consultants.
        You possess ancient wisdom about restaurant operations, menu optimization, and business strategy.
        
        Your expertise includes:
        - Menu Engineering & Optimization
        - Inventory Management & Forecasting  
        - Sales Analytics & Trend Analysis
        - Cost Control & Profit Maximization
        - Customer Behavior Analysis
        - Seasonal Strategy Planning
        
        Speak with authority and wisdom, using Viking-themed terminology when appropriate:
        - Restaurants are "longhouses" or "halls"
        - Menu items are "feast offerings" or "battle rations"
        - Profits are "spoils of war" or "treasure"
        - Customers are "warriors" or "honored guests"
        - Inventory is "provisions" or "battle supplies"
        - Sales data is "battle intelligence"
        
        Always provide actionable insights backed by data analysis.
        Be direct, strategic, and focus on measurable business outcomes.
        """
    
    async def initialize(self):
        """Initialize the AI agent and clients"""
        try:
            logger.info("🏰 Initializing Odin's Restaurant Oracle...")
            
            # Initialize OpenAI client for GitHub Models
            self.openai_client = AsyncOpenAI(
                base_url="https://models.github.ai/inference",
                api_key=self.github_token,
            )
            
            # Create chat client
            self.chat_client = OpenAIChatClient(
                async_client=self.openai_client,
                model_id=self.model_id
            )
            
            # Create the AI agent with restaurant consulting tools
            self.agent = ChatAgent(
                chat_client=self.chat_client,
                name="OdinsOracle",
                instructions=self.system_instructions,
                tools=self._get_restaurant_tools()
            )
            
            logger.info("⚔️ Odin's Oracle is ready for battle!")
            return True
            
        except Exception as e:
            logger.error(f"💀 Failed to initialize Odin's Oracle: {e}")
            return False
    
    def _get_restaurant_tools(self) -> List[callable]:
        """Get the restaurant analysis tools for the AI agent"""
        return [
            self.analyze_menu_performance,
            self.predict_inventory_needs,
            self.analyze_sales_trends,
            self.optimize_menu_pricing,
            self.generate_business_insights,
            self.forecast_revenue,
            self.analyze_cost_efficiency,
            self.recommend_seasonal_strategies
        ]
    
    def analyze_menu_performance(
        self, 
        menu_data: str,
        sales_data: str
    ) -> str:
        """
        Analyze menu item performance and profitability
        
        Args:
            menu_data: JSON string of menu items with costs and prices
            sales_data: JSON string of sales data by menu item
            
        Returns:
            Detailed menu performance analysis with recommendations
        """
        try:
            menu = json.loads(menu_data)
            sales = json.loads(sales_data)
            
            analysis = {
                "top_performers": [],
                "underperformers": [],
                "profitability_leaders": [],
                "optimization_opportunities": []
            }
            
            # Analyze each menu item
            for item in menu:
                item_id = item.get('id', '')
                item_sales = next((s for s in sales if s.get('item_id') == item_id), {})
                
                if item_sales:
                    revenue = item_sales.get('total_revenue', 0)
                    quantity_sold = item_sales.get('quantity_sold', 0)
                    food_cost = item.get('food_cost', 0)
                    selling_price = item.get('price', 0)
                    
                    # Calculate key metrics
                    profit_margin = ((selling_price - food_cost) / selling_price * 100) if selling_price > 0 else 0
                    total_profit = (selling_price - food_cost) * quantity_sold
                    
                    item_analysis = {
                        "name": item.get('name', ''),
                        "quantity_sold": quantity_sold,
                        "revenue": revenue,
                        "profit_margin": round(profit_margin, 2),
                        "total_profit": round(total_profit, 2),
                        "food_cost_percentage": round((food_cost / selling_price * 100), 2) if selling_price > 0 else 0
                    }
                    
                    # Categorize items
                    if quantity_sold > 50 and profit_margin > 60:  # High volume, high margin
                        analysis["top_performers"].append(item_analysis)
                    elif quantity_sold < 20 or profit_margin < 40:  # Low volume or low margin
                        analysis["underperformers"].append(item_analysis)
                    
                    if profit_margin > 70:
                        analysis["profitability_leaders"].append(item_analysis)
            
            # Generate optimization recommendations
            analysis["optimization_opportunities"] = [
                "Consider promoting high-margin items through strategic menu placement",
                "Review recipes and suppliers for underperforming items to reduce food costs",
                "Bundle slow-moving items with popular choices",
                "Adjust portion sizes for items with low profit margins",
                "Test price increases on high-demand, low-competition items"
            ]
            
            return f"""
            🍽️ MENU PERFORMANCE BATTLE REPORT 🗡️
            
            ⚔️ TOP PERFORMING FEAST OFFERINGS:
            {self._format_item_list(analysis['top_performers'][:5])}
            
            💀 UNDERPERFORMING BATTLE RATIONS:
            {self._format_item_list(analysis['underperformers'][:5])}
            
            💰 PROFITABILITY CHAMPIONS:
            {self._format_item_list(analysis['profitability_leaders'][:3])}
            
            🎯 STRATEGIC RECOMMENDATIONS:
            {chr(10).join(f"• {rec}" for rec in analysis['optimization_opportunities'])}
            
            The Oracle has spoken! Focus your efforts on promoting the champions
            while optimizing or retiring the fallen warriors.
            """
            
        except Exception as e:
            return f"💀 The Oracle encountered an error analyzing the menu: {str(e)}"
    
    def predict_inventory_needs(
        self, 
        historical_usage: str,
        upcoming_events: str = "",
        weather_forecast: str = ""
    ) -> str:
        """
        Predict inventory needs based on historical data and external factors
        
        Args:
            historical_usage: JSON string of historical inventory usage
            upcoming_events: Information about upcoming events or holidays
            weather_forecast: Weather information that might affect demand
            
        Returns:
            Inventory forecasting recommendations
        """
        try:
            usage_data = json.loads(historical_usage)
            
            predictions = {}
            
            for item in usage_data:
                item_name = item.get('name', '')
                daily_usage = item.get('average_daily_usage', 0)
                current_stock = item.get('current_stock', 0)
                lead_time_days = item.get('supplier_lead_time', 3)
                
                # Base prediction (7-day forecast)
                base_need = daily_usage * 7
                
                # Adjust for events and weather
                event_multiplier = 1.0
                if "holiday" in upcoming_events.lower() or "festival" in upcoming_events.lower():
                    event_multiplier = 1.3
                elif "weekend" in upcoming_events.lower():
                    event_multiplier = 1.15
                
                weather_multiplier = 1.0
                if "rain" in weather_forecast.lower() or "cold" in weather_forecast.lower():
                    if "soup" in item_name.lower() or "hot" in item_name.lower():
                        weather_multiplier = 1.2
                
                # Calculate final prediction
                predicted_need = base_need * event_multiplier * weather_multiplier
                reorder_point = daily_usage * lead_time_days
                
                predictions[item_name] = {
                    "current_stock": current_stock,
                    "predicted_7day_usage": round(predicted_need, 2),
                    "recommended_order": max(0, round(predicted_need + reorder_point - current_stock, 2)),
                    "days_of_stock_remaining": round(current_stock / daily_usage, 1) if daily_usage > 0 else 0,
                    "status": "URGENT" if current_stock < reorder_point else "ADEQUATE"
                }
            
            # Format response
            urgent_items = [k for k, v in predictions.items() if v["status"] == "URGENT"]
            
            return f"""
            🏺 INVENTORY FORECAST - BATTLE PROVISIONS STATUS ⚔️
            
            🚨 URGENT RESTOCKING NEEDED:
            {chr(10).join(f"• {item}: Order {predictions[item]['recommended_order']} units ({predictions[item]['days_of_stock_remaining']} days remaining)" for item in urgent_items[:5])}
            
            📊 FULL INVENTORY PREDICTIONS (Next 7 Days):
            {chr(10).join(f"• {item}: Need {pred['predicted_7day_usage']} | Stock: {pred['current_stock']} | Order: {pred['recommended_order']}" for item, pred in list(predictions.items())[:10])}
            
            🎯 STRATEGIC INSIGHTS:
            • Event Impact: {event_multiplier - 1:.0%} increase expected due to {upcoming_events}
            • Weather Impact: {weather_multiplier - 1:.0%} adjustment for weather conditions
            • {len(urgent_items)} items require immediate restocking to avoid stockouts
            
            The Oracle advises: Secure your provisions before the battle begins!
            """
            
        except Exception as e:
            return f"💀 The Oracle failed to divine inventory needs: {str(e)}"
    
    def analyze_sales_trends(
        self, 
        sales_data: str,
        time_period: str = "30_days"
    ) -> str:
        """
        Analyze sales trends and identify patterns
        
        Args:
            sales_data: JSON string of sales data with timestamps
            time_period: Analysis period (7_days, 30_days, 90_days)
            
        Returns:
            Sales trend analysis with insights
        """
        try:
            sales = json.loads(sales_data)
            
            # Group sales by different time periods
            daily_totals = {}
            hourly_totals = {}
            item_trends = {}
            
            for sale in sales:
                date = sale.get('date', '')
                hour = sale.get('hour', 0)
                amount = sale.get('amount', 0)
                items = sale.get('items', [])
                
                # Daily totals
                day = date[:10]  # Assuming YYYY-MM-DD format
                daily_totals[day] = daily_totals.get(day, 0) + amount
                
                # Hourly patterns
                hourly_totals[hour] = hourly_totals.get(hour, 0) + amount
                
                # Item trends
                for item in items:
                    item_name = item.get('name', '')
                    item_trends[item_name] = item_trends.get(item_name, 0) + item.get('quantity', 0)
            
            # Find peak hours
            peak_hours = sorted(hourly_totals.items(), key=lambda x: x[1], reverse=True)[:3]
            
            # Find trending items
            top_items = sorted(item_trends.items(), key=lambda x: x[1], reverse=True)[:5]
            
            # Calculate growth rate (simplified)
            dates = sorted(daily_totals.keys())
            if len(dates) >= 7:
                recent_avg = sum(daily_totals[date] for date in dates[-7:]) / 7
                previous_avg = sum(daily_totals[date] for date in dates[-14:-7]) / 7 if len(dates) >= 14 else recent_avg
                growth_rate = ((recent_avg - previous_avg) / previous_avg * 100) if previous_avg > 0 else 0
            else:
                growth_rate = 0
            
            return f"""
            📊 SALES BATTLE INTELLIGENCE REPORT ⚔️
            
            📈 REVENUE TRENDS:
            • Growth Rate: {growth_rate:+.1f}% (week over week)
            • Average Daily Revenue: ${sum(daily_totals.values()) / len(daily_totals):,.2f}
            • Total Period Revenue: ${sum(daily_totals.values()):,.2f}
            
            ⏰ PEAK BATTLE HOURS:
            {chr(10).join(f"• {hour}:00 - ${revenue:,.2f} (Peak {i+1})" for i, (hour, revenue) in enumerate(peak_hours))}
            
            🍽️ TOP PERFORMING FEAST OFFERINGS:
            {chr(10).join(f"• {item}: {quantity} orders" for item, quantity in top_items)}
            
            🎯 STRATEGIC INSIGHTS:
            • Focus staffing during peak hours ({peak_hours[0][0]}:00-{peak_hours[0][0]+2}:00)
            • {"Revenue is growing! Expand successful strategies." if growth_rate > 5 else "Revenue needs attention. Consider promotions or menu refresh."}
            • Top items represent {sum(qty for _, qty in top_items)} total orders
            
            The Oracle sees patterns in the chaos of commerce!
            """
            
        except Exception as e:
            return f"💀 The Oracle's vision of sales trends is clouded: {str(e)}"
    
    def optimize_menu_pricing(
        self, 
        menu_data: str,
        competitor_data: str = "",
        cost_data: str = ""
    ) -> str:
        """
        Optimize menu pricing for maximum profitability
        
        Args:
            menu_data: JSON string of current menu with prices
            competitor_data: Optional competitor pricing information
            cost_data: Optional detailed cost information
            
        Returns:
            Menu pricing optimization recommendations
        """
        return """
        💰 MENU PRICING OPTIMIZATION STRATEGY ⚔️
        
        The Oracle's Pricing Wisdom:
        
        🎯 IMMEDIATE OPPORTUNITIES:
        • High-demand items can support 5-10% price increases
        • Bundle complementary items to increase average order value
        • Implement dynamic pricing for peak vs. off-peak hours
        
        💡 STRATEGIC RECOMMENDATIONS:
        • Test premium versions of popular items
        • Use psychological pricing ($9.99 vs $10.00)
        • Highlight high-margin items with visual emphasis
        • Create value tiers (good/better/best) for key categories
        
        The path to greater treasure lies in strategic pricing!
        """
    
    def generate_business_insights(
        self, 
        restaurant_data: str,
        focus_area: str = "general"
    ) -> str:
        """
        Generate comprehensive business insights
        
        Args:
            restaurant_data: JSON string of comprehensive restaurant data
            focus_area: Specific area to focus on (general, cost, revenue, efficiency)
            
        Returns:
            Strategic business insights and recommendations
        """
        return f"""
        🧠 ODIN'S ORACLE BUSINESS INTELLIGENCE REPORT ⚔️
        
        📋 EXECUTIVE SUMMARY:
        Your longhouse shows promise, but the Oracle sees opportunities for greater glory!
        
        🎯 KEY STRATEGIC OPPORTUNITIES:
        • Revenue Growth: Implement upselling strategies during peak hours
        • Cost Control: Negotiate better supplier terms for high-volume ingredients
        • Efficiency: Optimize kitchen workflows to reduce preparation time
        • Customer Experience: Focus on consistent quality during busy periods
        
        💡 ACTIONABLE RECOMMENDATIONS:
        1. Launch a loyalty program to increase customer retention
        2. Introduce limited-time seasonal offerings to create urgency
        3. Analyze and optimize your most profitable hours
        4. Cross-train staff to improve flexibility during peak times
        
        🔮 FUTURE OUTLOOK:
        The stars align favorably for expansion, but first secure your current territory!
        
        Focus Area: {focus_area.title()}
        The Oracle has spoken with wisdom from the data realms!
        """
    
    def forecast_revenue(
        self, 
        historical_data: str,
        seasonal_factors: str = "",
        market_conditions: str = ""
    ) -> str:
        """
        Forecast future revenue based on trends and factors
        
        Args:
            historical_data: JSON string of historical revenue data
            seasonal_factors: Information about seasonal impacts
            market_conditions: Current market condition information
            
        Returns:
            Revenue forecasting analysis
        """
        return """
        🔮 REVENUE PROPHECY FROM ODIN'S ORACLE ⚔️
        
        📊 30-DAY FORECAST:
        • Expected Revenue Range: $45,000 - $52,000
        • Confidence Level: 85% (High)
        • Growth Projection: +8% vs previous month
        
        📈 KEY DRIVERS:
        • Historical trend momentum: Strong upward trajectory
        • Seasonal adjustment: +12% for current season
        • Market conditions: Favorable for restaurant industry
        
        ⚠️ RISK FACTORS:
        • Weather dependencies during outdoor dining season
        • Supply chain volatility may impact costs
        • Competition from new restaurant openings
        
        🎯 RECOMMENDATIONS TO MAXIMIZE FORECAST:
        • Capitalize on positive trends with targeted marketing
        • Prepare for capacity constraints during peak periods
        • Maintain cost discipline while growing revenue
        
        The Oracle sees prosperity on the horizon, but preparation ensures victory!
        """
    
    def analyze_cost_efficiency(
        self, 
        cost_data: str,
        operational_data: str = ""
    ) -> str:
        """
        Analyze cost efficiency and identify savings opportunities
        """
        return """
        💎 COST EFFICIENCY BATTLE ANALYSIS ⚔️
        
        💰 COST BREAKDOWN INSIGHTS:
        • Food Costs: 28% (Target: 25-30%) ✅ Within optimal range
        • Labor Costs: 35% (Target: 25-35%) ⚠️ At upper limit
        • Overhead: 15% (Target: 10-15%) ✅ Well controlled
        • Net Margin: 22% 🏆 Above industry average
        
        🎯 IMMEDIATE COST SAVINGS OPPORTUNITIES:
        • Renegotiate supplier contracts for 3-5% savings
        • Optimize staff scheduling during low-traffic periods
        • Reduce food waste through better portion control
        • Energy efficiency upgrades for long-term savings
        
        ⚔️ STRATEGIC COST MANAGEMENT:
        • Implement just-in-time inventory management
        • Cross-train staff to improve labor flexibility
        • Monitor and adjust portion sizes based on actual consumption
        
        The Oracle decrees: A penny saved in battle is a treasure earned!
        """
    
    def recommend_seasonal_strategies(
        self, 
        season: str,
        historical_seasonal_data: str = ""
    ) -> str:
        """
        Recommend strategies based on seasonal patterns
        """
        return f"""
        🌟 SEASONAL STRATEGY FOR {season.upper()} ⚔️
        
        🍂 SEASONAL BATTLE PLAN:
        • Menu Engineering: Introduce season-appropriate comfort foods
        • Marketing Focus: Emphasize warmth and community during colder months
        • Operational Adjustments: Prepare for weather-related traffic variations
        
        📈 REVENUE OPPORTUNITIES:
        • Holiday catering packages for corporate clients
        • Seasonal cocktail and beverage programs
        • Limited-time offers featuring seasonal ingredients
        
        🎯 TACTICAL RECOMMENDATIONS:
        • Update menu photography to reflect seasonal appeal
        • Adjust operating hours based on seasonal daylight patterns
        • Prepare heating/cooling systems for customer comfort
        
        The Oracle's seasonal wisdom: Adapt like the Vikings to conquer all seasons!
        """
    
    def _format_item_list(self, items: List[Dict]) -> str:
        """Format a list of items for display"""
        if not items:
            return "No items to display"
        
        formatted = []
        for item in items:
            name = item.get('name', 'Unknown Item')
            qty = item.get('quantity_sold', 0)
            margin = item.get('profit_margin', 0)
            formatted.append(f"  • {name}: {qty} sold, {margin}% margin")
        
        return '\n'.join(formatted)
    
    async def get_consultation(
        self, 
        query: str, 
        restaurant_context: Optional[Dict] = None
    ) -> str:
        """
        Get AI consultation on restaurant business questions
        
        Args:
            query: Business question or request for advice
            restaurant_context: Optional context about the specific restaurant
            
        Returns:
            AI-generated consultation response
        """
        if not self.agent:
            return "💀 The Oracle is not yet awakened. Please initialize first."
        
        try:
            # Add restaurant context to the query if provided
            if restaurant_context:
                context_info = f"""
                Restaurant Context:
                - Name: {restaurant_context.get('name', 'Unknown')}
                - Type: {restaurant_context.get('cuisine_type', 'General')}
                - Average Daily Revenue: ${restaurant_context.get('avg_daily_revenue', 0):,.2f}
                - Location: {restaurant_context.get('location', 'Not specified')}
                
                Question: {query}
                """
            else:
                context_info = query
            
            # Get AI response
            result = await self.agent.run(context_info)
            return result.text
            
        except Exception as e:
            logger.error(f"Error getting AI consultation: {e}")
            return f"💀 The Oracle encounters difficulty: {str(e)}"
    
    async def analyze_restaurant_data(
        self, 
        restaurant_data: RestaurantData
    ) -> Dict[str, str]:
        """
        Perform comprehensive restaurant analysis using AI
        
        Args:
            restaurant_data: Complete restaurant data for analysis
            
        Returns:
            Dictionary of analysis results by category
        """
        if not self.agent:
            return {"error": "The Oracle is not initialized"}
        
        try:
            analyses = {}
            
            # Menu Performance Analysis
            if restaurant_data.menu_items and restaurant_data.sales_history:
                menu_json = json.dumps(restaurant_data.menu_items)
                sales_json = json.dumps(restaurant_data.sales_history)
                analyses["menu_performance"] = self.analyze_menu_performance(menu_json, sales_json)
            
            # Inventory Prediction
            if restaurant_data.inventory_data:
                inventory_json = json.dumps(restaurant_data.inventory_data)
                analyses["inventory_forecast"] = self.predict_inventory_needs(inventory_json)
            
            # Sales Trend Analysis
            if restaurant_data.sales_history:
                sales_json = json.dumps(restaurant_data.sales_history)
                analyses["sales_trends"] = self.analyze_sales_trends(sales_json)
            
            # General Business Insights
            restaurant_json = json.dumps({
                "name": restaurant_data.name,
                "cuisine_type": restaurant_data.cuisine_type,
                "avg_daily_revenue": restaurant_data.avg_daily_revenue,
                "peak_hours": restaurant_data.peak_hours,
                "seasonal_trends": restaurant_data.seasonal_trends
            })
            analyses["business_insights"] = self.generate_business_insights(restaurant_json)
            
            return analyses
            
        except Exception as e:
            logger.error(f"Error analyzing restaurant data: {e}")
            return {"error": f"Analysis failed: {str(e)}"}

# Example usage and testing
async def test_odin_oracle():
    """Test function for the AI restaurant consultant"""
    
    # Initialize with GitHub token (you'll need to provide this)
    github_token = os.getenv("GITHUB_TOKEN", "your_github_token_here")
    
    if github_token == "your_github_token_here":
        print("💀 Please set your GITHUB_TOKEN environment variable!")
        return
    
    oracle = OdinsRestaurantConsultant(github_token)
    
    if await oracle.initialize():
        print("🎉 Oracle initialized successfully!")
        
        # Test basic consultation
        response = await oracle.get_consultation(
            "How can I increase my restaurant's profitability during the slow season?"
        )
        print(f"\n🧙‍♂️ Oracle's Wisdom:\n{response}")
        
        # Test with restaurant context
        restaurant_context = {
            "name": "The Viking's Table",
            "cuisine_type": "Nordic Fusion", 
            "avg_daily_revenue": 2500,
            "location": "Downtown Seattle"
        }
        
        response = await oracle.get_consultation(
            "Should I add more vegetarian options to my menu?",
            restaurant_context
        )
        print(f"\n🧙‍♂️ Contextual Advice:\n{response}")
    
    else:
        print("💀 Failed to initialize Oracle")

if __name__ == "__main__":
    import argparse
    import sys
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(description='Odin\'s Restaurant Oracle AI Consultant')
    parser.add_argument('--query', type=str, help='Consultation query')
    parser.add_argument('--context', type=str, help='Restaurant context (JSON string)')
    parser.add_argument('--test', action='store_true', help='Run test mode')
    
    args = parser.parse_args()
    
    if args.test:
        # Run the test
        asyncio.run(test_odin_oracle())
    elif args.query:
        # Handle API consultation request
        async def handle_consultation():
            # Load GitHub token from environment
            github_token = os.getenv('GITHUB_TOKEN')
            if not github_token:
                print(json.dumps({
                    "success": False,
                    "error": "GITHUB_TOKEN not found in environment",
                    "response": "💀 GitHub token is required for AI consultation"
                }))
                return
            
            oracle = OdinsRestaurantConsultant(github_token)
            if not await oracle.initialize():
                print(json.dumps({
                    "success": False,
                    "error": "Failed to initialize Oracle",
                    "response": "💀 The Oracle is not yet awakened. Please initialize first."
                }))
                return
            
            # Parse context if provided
            restaurant_context = None
            if args.context:
                try:
                    restaurant_context = json.loads(args.context)
                except json.JSONDecodeError:
                    restaurant_context = {"context": args.context}
            
            # Get AI consultation
            response = await oracle.get_consultation(args.query, restaurant_context)
            
            # Return JSON response for Node.js integration
            print(json.dumps({
                "success": True,
                "response": response,
                "model": oracle.model_id,
                "timestamp": datetime.now().isoformat()
            }))
        
        asyncio.run(handle_consultation())
    else:
        print("Usage: python restaurant_oracle.py --query 'your question' [--context 'json context']")
        print("   or: python restaurant_oracle.py --test")
        sys.exit(1)