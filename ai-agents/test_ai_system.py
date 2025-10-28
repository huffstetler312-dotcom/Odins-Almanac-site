#!/usr/bin/env python3
"""
Test script for Odin's AI Restaurant Oracle
Tests the AI system capabilities without requiring GitHub token
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

def test_ai_imports():
    """Test that all AI dependencies are properly installed"""
    try:
        print("🏰 Testing AI Dependencies...")
        
        # Test core imports
        import azure.ai.agents
        print("✅ Azure AI Agents imported")
        
        import openai
        print("✅ OpenAI SDK imported")
        
        from agent_framework import ChatAgent
        print("✅ Microsoft Agent Framework imported")
        
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_ai_structure():
    """Test the AI consultant structure without token"""
    try:
        print("\n🔧 Testing AI Structure...")
        
        from restaurant_oracle import OdinsRestaurantConsultant, RestaurantData
        print("✅ Restaurant Oracle class imported")
        
        # Test with placeholder token
        oracle = OdinsRestaurantConsultant("test-token")
        print("✅ Oracle instance created")
        
        print(f"✅ Model ID: {oracle.model_id}")
        print(f"✅ System instructions configured: {len(oracle.system_instructions)} characters")
        
        return True
    except Exception as e:
        print(f"❌ Structure test failed: {e}")
        return False

def show_ai_capabilities():
    """Display the AI system capabilities"""
    print("\n🎯 AI ORACLE CAPABILITIES:")
    print("="*50)
    
    capabilities = [
        "🍽️ Menu Performance Analysis",
        "📊 Inventory Forecasting", 
        "💰 Revenue Optimization",
        "🎯 Sales Trend Analysis",
        "🏆 Business Insights Generation",
        "📈 Market Analysis",
        "⚡ Operational Efficiency",
        "🔮 Predictive Analytics"
    ]
    
    for i, capability in enumerate(capabilities, 1):
        print(f"  {i}. {capability}")

def show_next_steps():
    """Display next steps for full activation"""
    print("\n🚀 NEXT STEPS FOR ACTIVATION:")
    print("="*50)
    print("1. 🔑 Get GitHub Personal Access Token:")
    print("   - Go to: https://github.com/settings/tokens")
    print("   - Generate new token (classic)")
    print("   - No specific scopes needed")
    
    print("\n2. 📝 Update .env file:")
    print("   GITHUB_TOKEN=ghp_your_actual_token_here")
    
    print("\n3. 🧪 Test with real AI:")
    print("   cd ai-agents && python ai_oracle_cli.py")
    
    print("\n4. 🏰 Start full server:")
    print("   cd server && npm start")

def main():
    """Main test function"""
    print("🏰 ODIN'S AI ORACLE - SYSTEM TEST")
    print("="*60)
    
    # Test imports
    imports_ok = test_ai_imports()
    
    # Test structure  
    structure_ok = test_ai_structure()
    
    # Show capabilities
    show_ai_capabilities()
    
    # Show next steps
    show_next_steps()
    
    # Final status
    print(f"\n🏆 SYSTEM STATUS:")
    print(f"✅ Dependencies: {'READY' if imports_ok else 'FAILED'}")
    print(f"✅ Structure: {'READY' if structure_ok else 'FAILED'}")
    print(f"🔑 GitHub Token: NEEDED")
    print(f"⚔️ Battle Readiness: {'90%' if imports_ok and structure_ok else '50%'}")
    
    if imports_ok and structure_ok:
        print("\n🎉 AI Oracle is ready for GitHub token activation!")
    else:
        print("\n❌ Please fix the issues above before proceeding.")

if __name__ == "__main__":
    main()