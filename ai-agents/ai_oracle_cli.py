#!/usr/bin/env python3
"""
ODIN'S ALMANAC - AI ORACLE COMMAND LINE INTERFACE ⚔️
====================================================

Simplified command-line interface for testing the AI restaurant consultant.
This script allows direct interaction with the AI Oracle for testing purposes.

Usage:
    python ai_oracle_cli.py --query "Your restaurant question here"
    python ai_oracle_cli.py --test

Requirements:
    - GitHub Personal Access Token set in GITHUB_TOKEN environment variable
    - agent-framework-azure-ai package installed (pip install agent-framework-azure-ai --pre)
"""

import asyncio
import argparse
import json
import os
import sys
from datetime import datetime

def check_requirements():
    """Check if required packages are installed"""
    try:
        import openai
        from agent_framework import ChatAgent
        from agent_framework.openai import OpenAIChatClient
        return True
    except ImportError as e:
        print(f"💀 Missing required package: {e}")
        print("\n🛠️ To install requirements:")
        print("pip install agent-framework-azure-ai --pre")
        print("pip install openai>=1.12.0")
        print("pip install python-dotenv")
        return False

async def simple_ai_consultation(query: str, github_token: str, model_id: str = "openai/gpt-4.1"):
    """
    Simple AI consultation without complex tools
    """
    try:
        from openai import AsyncOpenAI
        from agent_framework import ChatAgent
        from agent_framework.openai import OpenAIChatClient

        print(f"🏰 Awakening Odin's Oracle with model {model_id}...")
        
        # Initialize OpenAI client for GitHub Models
        openai_client = AsyncOpenAI(
            base_url="https://models.github.ai/inference",
            api_key=github_token,
        )
        
        # Create chat client
        chat_client = OpenAIChatClient(
            async_client=openai_client,
            model_id=model_id
        )
        
        # Viking-themed system instructions
        system_instructions = """
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
        
        Always provide actionable insights backed by business knowledge.
        Be direct, strategic, and focus on measurable business outcomes.
        Keep responses concise but comprehensive.
        """
        
        # Create the AI agent
        agent = ChatAgent(
            chat_client=chat_client,
            name="OdinsOracle",
            instructions=system_instructions
        )
        
        print("⚔️ Oracle awakened! Seeking wisdom...")
        
        # Get AI response
        result = await agent.run(query)
        
        return {
            "success": True,
            "oracle_response": result.text,
            "model_used": model_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

async def run_test_consultation():
    """Run a test consultation with sample questions"""
    
    github_token = os.getenv('GITHUB_TOKEN')
    if not github_token:
        print("💀 GITHUB_TOKEN environment variable not set!")
        print("\n🛠️ To get a GitHub token:")
        print("1. Go to https://github.com/settings/tokens")
        print("2. Create a Personal Access Token with appropriate scopes")
        print("3. Set it as environment variable: export GITHUB_TOKEN=your_token")
        return False
    
    test_questions = [
        "How can I increase my restaurant's profitability during the slow winter season?",
        "What are the key metrics I should track for menu optimization?",
        "How do I reduce food waste while maintaining quality in my kitchen?"
    ]
    
    print("🧪 Running AI Oracle Test Suite...")
    print("=" * 60)
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n🔮 Test {i}: {question}")
        print("-" * 50)
        
        result = await simple_ai_consultation(question, github_token)
        
        if result["success"]:
            print(f"✅ Oracle Response:")
            print(f"{result['oracle_response']}")
            print(f"\n📊 Model: {result['model_used']}")
        else:
            print(f"💀 Error: {result['error']}")
    
    print("\n" + "=" * 60)
    print("🍻 Test suite completed!")
    return True

async def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="Odin's Oracle - AI Restaurant Consultant CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python ai_oracle_cli.py --test
    python ai_oracle_cli.py --query "How can I optimize my menu pricing?"
    python ai_oracle_cli.py --query "What inventory should I stock for next week?" --model "openai/gpt-4o"
        """
    )
    
    parser.add_argument('--query', '-q', type=str, help='Restaurant business question for the Oracle')
    parser.add_argument('--test', '-t', action='store_true', help='Run test suite with sample questions')
    parser.add_argument('--model', '-m', type=str, default='openai/gpt-4.1', help='AI model to use (default: openai/gpt-4.1)')
    parser.add_argument('--context', '-c', type=str, help='JSON string with restaurant context')
    
    args = parser.parse_args()
    
    # Check requirements
    if not check_requirements():
        return 1
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass  # dotenv is optional
    
    # Get GitHub token
    github_token = os.getenv('GITHUB_TOKEN')
    if not github_token:
        print("💀 Error: GITHUB_TOKEN environment variable required!")
        print("\n🛠️ Setup instructions:")
        print("1. Get token: https://github.com/settings/tokens")
        print("2. Set environment: export GITHUB_TOKEN=your_token")
        print("3. Or add to .env file: GITHUB_TOKEN=your_token")
        return 1
    
    # Handle different modes
    if args.test:
        success = await run_test_consultation()
        return 0 if success else 1
    
    elif args.query:
        print("🏰 Consulting with Odin's Oracle...")
        
        result = await simple_ai_consultation(args.query, github_token, args.model)
        
        if result["success"]:
            print("\n" + "=" * 60)
            print("🧙‍♂️ ODIN'S ORACLE SPEAKS:")
            print("=" * 60)
            print(result["oracle_response"])
            print("\n" + "-" * 60)
            print(f"📊 Model: {result['model_used']}")
            print(f"⏰ Time: {result['timestamp']}")
            print("🍻 May this wisdom guide your longhouse to prosperity!")
            return 0
        else:
            print(f"💀 Oracle Error: {result['error']}")
            return 1
    
    else:
        parser.print_help()
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n💀 Consultation interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"💀 Fatal error: {e}")
        sys.exit(1)