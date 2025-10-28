#!/usr/bin/env python3
"""
GitHub Token Setup Helper
"""
import os
import sys

def update_env_token():
    """Interactive token update"""
    print("🔑 GITHUB TOKEN SETUP")
    print("=" * 30)
    
    env_file = r"c:\Users\huffs\OneDrive\Documents\GitHub\Odins-Almanac-site\.env"
    
    # Get token from user
    token = input("Enter your GitHub token (ghp_...): ").strip()
    
    if not token.startswith('ghp_'):
        print("❌ Invalid token format. Should start with 'ghp_'")
        return False
    
    try:
        # Read the file
        with open(env_file, 'r') as f:
            content = f.read()
        
        # Replace the token
        updated_content = content.replace(
            'GITHUB_TOKEN=ghp_your_github_personal_access_token_here',
            f'GITHUB_TOKEN={token}'
        )
        
        # Write back
        with open(env_file, 'w') as f:
            f.write(updated_content)
        
        print(f"✅ Token updated successfully!")
        print(f"✅ File: {env_file}")
        print(f"✅ Token: {token[:10]}...")
        return True
        
    except Exception as e:
        print(f"❌ Error updating file: {e}")
        return False

if __name__ == "__main__":
    if update_env_token():
        print("\n🎉 Ready to activate Oracle!")
        print("Run: python activate_oracle.py")
    else:
        print("\n❌ Please try again or update manually.")