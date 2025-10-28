# 🤖 AI Oracle Setup Guide

## 🔑 GitHub Token Setup (Required)

1. **Go to GitHub Token Settings**: https://github.com/settings/tokens
2. **Click "Generate new token"** → **"Generate new token (classic)"**
3. **Configure Token**:
   - **Note**: `Odins-Almanac-AI-Oracle`
   - **Expiration**: Choose your preferred duration
   - **Scopes**: No specific scopes required for GitHub Models
4. **Copy the token** (starts with `ghp_`)
5. **Update `.env` file**:
   ```bash
   GITHUB_TOKEN=ghp_your_actual_token_here
   ```

## 🧪 Test AI System

### Option 1: Direct Python Test
```bash
cd ai-agents
python ai_oracle_cli.py
```

### Option 2: API Endpoints (requires server running)
```bash
# Start server
cd server && npm start

# Test AI status (in another terminal)
curl http://localhost:3001/api/ai/status

# Test AI consultation (needs authentication token)
curl -X POST http://localhost:3001/api/ai/consultation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"How can I optimize my menu for better profits?"}'
```

## 🏆 AI Capabilities Available

### 📊 **Menu Analysis**
- Dish performance analytics
- Profitability optimization
- Popularity trends

### 📈 **Inventory Intelligence** 
- Stock level forecasting
- Demand prediction
- Waste reduction strategies

### 💰 **Revenue Optimization**
- Pricing strategies
- Upselling opportunities
- Cost analysis

### 🎯 **Business Insights**
- Market positioning
- Competitive analysis
- Growth recommendations

### 📉 **Sales Analytics**
- Customer behavior patterns
- Seasonal trends
- Performance metrics

## 🛡️ Authentication Levels

- **Thrall** (Basic): Read-only AI insights
- **Huskarl** (Manager): Full AI consultation access  
- **Hirdman** (Owner): Advanced analytics + predictions
- **Jarl** (Admin): Complete AI system access + configuration

## 🚀 Next Steps

1. ✅ Set GitHub Token
2. 🧪 Test AI System  
3. 🏰 Integrate with Restaurant Data
4. 📊 Deploy AI Dashboard
5. ⚔️ Launch Viking AI Oracle!