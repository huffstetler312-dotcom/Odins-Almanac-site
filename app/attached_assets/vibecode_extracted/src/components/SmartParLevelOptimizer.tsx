/**
 * PROPRIETARY ALGORITHM - POTENTIAL PATENT PENDING
 * 
 * Smart Par Level Optimization System (SPLOS)
 * 
 * This component integrates the Predictive Inventory Optimization Engine
 * with the user interface to provide intelligent, automated par level
 * adjustments with user oversight and manual override capabilities.
 * 
 * PATENT CLAIMS:
 * - Real-time par level optimization with machine learning
 * - User-friendly interface for reviewing AI recommendations
 * - Automated implementation with confidence thresholds
 * - Historical performance tracking and algorithm improvement
 */

import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useInventoryStore, InventoryItem } from "../state/inventoryStore";
import { predictiveInventoryEngine } from "../api/predictive-inventory-engine";
import { cn } from "../utils/cn";

interface OptimizationRecommendation {
  itemId: string;
  itemName: string;
  currentParLevel: number;
  recommendedParLevel: number;
  confidence: number;
  demandForecast: number;
  expectedWasteReduction: number;
  costOptimization: number;
  stockoutRisk: number;
  reasoning: string[];
}

interface SmartParLevelOptimizerProps {
  className?: string;
}

export const SmartParLevelOptimizer: React.FC<SmartParLevelOptimizerProps> = ({ className }) => {
  const { items, updateItem } = useInventoryStore();
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Run initial optimization analysis
    runOptimizationAnalysis();
    
    // Set up periodic optimization (every 4 hours)
    const interval = setInterval(() => {
      if (autoOptimizeEnabled) {
        runAutomaticOptimization();
      }
    }, 4 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoOptimizeEnabled]);

  /**
   * PATENT FEATURE: Automated optimization analysis with confidence scoring
   */
  const runOptimizationAnalysis = async () => {
    setIsAnalyzing(true);
    const newRecommendations: OptimizationRecommendation[] = [];

    try {
      for (const item of items) {
        const metrics = await predictiveInventoryEngine.predictDemand(item, 24);
        
        // Only recommend changes with high confidence and meaningful impact
        if (metrics.confidenceLevel > 0.7 && 
            Math.abs(metrics.recommendedParLevel - item.parLevel) > (item.parLevel * 0.1)) {
          
          const reasoning = generateReasoning(item, metrics);
          
          newRecommendations.push({
            itemId: item.id,
            itemName: item.name,
            currentParLevel: item.parLevel || 0,
            recommendedParLevel: Math.round(metrics.recommendedParLevel),
            confidence: metrics.confidenceLevel,
            demandForecast: metrics.demandForecast,
            expectedWasteReduction: metrics.expectedWasteReduction,
            costOptimization: metrics.costOptimization,
            stockoutRisk: metrics.stockoutRisk,
            reasoning,
          });
        }
      }

      setRecommendations(newRecommendations);
      setLastOptimization(new Date().toISOString());
    } catch (error) {
      console.error("Optimization analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * PATENT FEATURE: Automatic implementation with confidence thresholds
   */
  const runAutomaticOptimization = async () => {
    const highConfidenceRecommendations = recommendations.filter(
      rec => rec.confidence > 0.85 && rec.stockoutRisk < 0.2
    );

    for (const rec of highConfidenceRecommendations) {
      await implementRecommendation(rec.itemId, rec.recommendedParLevel, true);
    }

    if (highConfidenceRecommendations.length > 0) {
      setLastOptimization(new Date().toISOString());
    }
  };

  const implementRecommendation = async (itemId: string, newParLevel: number, isAutomatic = false) => {
    updateItem(itemId, { parLevel: newParLevel });
    
    // Remove implemented recommendation
    setRecommendations(prev => prev.filter(rec => rec.itemId !== itemId));
    
    // Log implementation for patent documentation
    console.log(`${isAutomatic ? 'Automatic' : 'Manual'} par level optimization: Item ${itemId} updated to ${newParLevel}`);
  };

  const dismissRecommendation = (itemId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.itemId !== itemId));
  };

  const toggleDetails = (itemId: string) => {
    setShowDetails(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const generateReasoning = (item: InventoryItem, metrics: any): string[] => {
    const reasons: string[] = [];
    
    if (metrics.demandForecast > item.parLevel * 1.2) {
      reasons.push("Demand forecast exceeds current par level");
    }
    
    if (metrics.expectedWasteReduction > 0) {
      reasons.push(`Reduces waste by ${metrics.expectedWasteReduction.toFixed(1)} units`);
    }
    
    if (metrics.stockoutRisk > 0.3) {
      reasons.push("High stockout risk detected");
    }
    
    if (metrics.costOptimization > 0) {
      reasons.push(`Cost optimization: $${metrics.costOptimization.toFixed(2)} savings`);
    }

    return reasons.length > 0 ? reasons : ["Optimizes inventory efficiency"];
  };

  const getRecommendationColor = (confidence: number) => {
    if (confidence > 0.85) return "text-green-600";
    if (confidence > 0.75) return "text-yellow-600";
    return "text-orange-600";
  };

  const getRecommendationBorder = (confidence: number) => {
    if (confidence > 0.85) return "border-green-200 bg-green-50";
    if (confidence > 0.75) return "border-yellow-200 bg-yellow-50";
    return "border-orange-200 bg-orange-50";
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <View className={cn("bg-white rounded-xl p-4 border border-gray-100 shadow-sm", className)}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
            <Ionicons name="bulb" size={16} color="#7C3AED" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-900">
              Smart Par Level Optimizer
            </Text>
            <Text className="text-xs text-gray-500">
              AI-powered inventory optimization
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center space-x-3">
          {isAnalyzing && (
            <View className="flex-row items-center">
              <Ionicons name="sync" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-500 ml-1">Analyzing...</Text>
            </View>
          )}
          
          <Pressable
            onPress={runOptimizationAnalysis}
            disabled={isAnalyzing}
            className={cn(
              "px-3 py-1 rounded-lg",
              isAnalyzing ? "bg-gray-100" : "bg-purple-50 active:bg-purple-100"
            )}
          >
            <Text className={cn(
              "text-xs font-medium",
              isAnalyzing ? "text-gray-500" : "text-purple-700"
            )}>
              {isAnalyzing ? "Analyzing..." : "Optimize"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Auto-optimization Toggle */}
      <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <View>
          <Text className="text-sm font-medium text-gray-900">
            Automatic Optimization
          </Text>
          <Text className="text-xs text-gray-600">
            Implements high-confidence recommendations automatically
          </Text>
        </View>
        <Switch
          value={autoOptimizeEnabled}
          onValueChange={setAutoOptimizeEnabled}
          trackColor={{ false: "#D1D5DB", true: "#7C3AED" }}
          thumbColor={autoOptimizeEnabled ? "#FFFFFF" : "#FFFFFF"}
        />
      </View>

      {/* Last Optimization */}
      {lastOptimization && (
        <View className="flex-row items-center mb-4">
          <Ionicons name="time" size={14} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-2">
            Last optimization: {new Date(lastOptimization).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <View className="text-center py-6">
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          <Text className="text-gray-600 font-medium mt-2">
            All Par Levels Optimized
          </Text>
          <Text className="text-gray-500 text-sm">
            Your inventory levels are currently optimal
          </Text>
        </View>
      ) : (
        <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
          <View className="space-y-3">
            {recommendations.map((rec) => (
              <View
                key={rec.itemId}
                className={cn("rounded-lg border p-3", getRecommendationBorder(rec.confidence))}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {rec.itemName}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-sm text-gray-600">
                        {rec.currentParLevel} → {rec.recommendedParLevel} units
                      </Text>
                      <View className="ml-2 px-2 py-0.5 rounded-full bg-white">
                        <Text className={cn("text-xs font-medium", getRecommendationColor(rec.confidence))}>
                          {(rec.confidence * 100).toFixed(0)}% confidence
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row space-x-1">
                    <Pressable
                      onPress={() => toggleDetails(rec.itemId)}
                      className="p-1 rounded bg-white"
                    >
                      <Ionicons 
                        name={showDetails[rec.itemId] ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#6B7280" 
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Primary Reasoning */}
                <Text className="text-xs text-gray-600 mb-3">
                  {rec.reasoning[0]}
                </Text>

                {/* Detailed Information */}
                {showDetails[rec.itemId] && (
                  <View className="border-t border-gray-200 pt-3 mb-3">
                    <View className="grid grid-cols-2 gap-2 mb-2">
                      <View>
                        <Text className="text-xs text-gray-500">Demand Forecast</Text>
                        <Text className="text-sm font-medium">{rec.demandForecast.toFixed(1)} units</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-gray-500">Stockout Risk</Text>
                        <Text className="text-sm font-medium">{(rec.stockoutRisk * 100).toFixed(0)}%</Text>
                      </View>
                    </View>
                    
                    {rec.expectedWasteReduction > 0 && (
                      <View className="mb-2">
                        <Text className="text-xs text-gray-500">Expected Waste Reduction</Text>
                        <Text className="text-sm font-medium text-green-600">
                          -{rec.expectedWasteReduction.toFixed(1)} units
                        </Text>
                      </View>
                    )}

                    <View className="space-y-1">
                      {rec.reasoning.map((reason, index) => (
                        <Text key={index} className="text-xs text-gray-600">
                          • {reason}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row space-x-2">
                  <Pressable
                    onPress={() => implementRecommendation(rec.itemId, rec.recommendedParLevel)}
                    className="flex-1 bg-purple-600 rounded-lg py-2 active:bg-purple-700"
                  >
                    <Text className="text-white font-medium text-center text-sm">
                      Implement
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => dismissRecommendation(rec.itemId)}
                    className="bg-gray-200 rounded-lg py-2 px-4 active:bg-gray-300"
                  >
                    <Text className="text-gray-700 font-medium text-sm">
                      Dismiss
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};