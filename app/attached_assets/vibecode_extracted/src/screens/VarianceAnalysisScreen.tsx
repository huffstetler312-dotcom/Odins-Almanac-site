import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useInventoryStore } from "../state/inventoryStore";
import { 
  inventoryVarianceAnalysisSystem, 
  VarianceAnalysis, 
  VarianceReport, 
  InventoryCount 
} from "../api/inventory-variance-analysis";
import { cn } from "../utils/cn";

interface VarianceAnalysisScreenProps {
  onBack: () => void;
}

export const VarianceAnalysisScreen: React.FC<VarianceAnalysisScreenProps> = ({ onBack }) => {
  const { items } = useInventoryStore();
  
  const [currentCounts, setCurrentCounts] = useState<Record<string, string>>({});
  const [variances, setVariances] = useState<VarianceAnalysis[]>([]);
  const [report, setReport] = useState<VarianceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(7); // days
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedVariance, setSelectedVariance] = useState<VarianceAnalysis | null>(null);
  
  // Use selectedVariance for detailed modal (placeholder for future enhancement)
  const _ = selectedVariance;

  useEffect(() => {
    // Initialize current counts with current stock
    const initialCounts: Record<string, string> = {};
    items.forEach(item => {
      initialCounts[item.id] = item.currentStock.toString();
    });
    setCurrentCounts(initialCounts);
  }, [items]);

  const handleCountChange = (itemId: string, value: string) => {
    setCurrentCounts(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const runVarianceAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000).toISOString();
      
      // Create inventory counts from current inputs
      const inventoryCounts: InventoryCount[] = Object.entries(currentCounts)
        .map(([itemId, countStr]) => ({
          id: `count_${itemId}_${Date.now()}`,
          itemId,
          countDate: new Date().toISOString(),
          actualCount: parseFloat(countStr) || 0,
          countedBy: "Current User",
          countMethod: "physical" as const,
        }));

      // Generate variance report
      const varianceReport = await inventoryVarianceAnalysisSystem.generateVarianceReport(
        startDate,
        endDate,
        inventoryCounts
      );

      setReport(varianceReport);
      
      // Combine all variances for display
      const allVariances = [
        ...varianceReport.shortages,
        ...varianceReport.overages,
        ...varianceReport.withinTolerance
      ].sort((a, b) => Math.abs(b.valueVariance) - Math.abs(a.valueVariance));
      
      setVariances(allVariances);
      
    } catch (error) {
      Alert.alert("Analysis Failed", "Could not complete variance analysis. Please try again.");
      console.error("Variance analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportSpreadsheet = async () => {
    if (!report) return;
    
    try {
      const csvData = inventoryVarianceAnalysisSystem.exportVarianceSpreadsheet(report);
      
      // In a real app, you would save this to a file or share it
      await Share.share({
        message: csvData,
        title: "Inventory Variance Report",
      });
    } catch (error) {
      Alert.alert("Export Failed", "Could not export variance report.");
    }
  };

  const getVarianceColor = (variance: VarianceAnalysis) => {
    if (variance.severityLevel === "critical") return "text-red-600";
    if (variance.severityLevel === "high") return "text-orange-600";
    if (variance.severityLevel === "medium") return "text-yellow-600";
    return "text-green-600";
  };

  const getVarianceBgColor = (variance: VarianceAnalysis) => {
    if (variance.severityLevel === "critical") return "bg-red-50 border-red-200";
    if (variance.severityLevel === "high") return "bg-orange-50 border-orange-200";
    if (variance.severityLevel === "medium") return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  const formatVariancePercent = (percent: number) => {
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Pressable
                onPress={onBack}
                className="mr-3 p-2 rounded-lg bg-white border border-gray-200"
              >
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </Pressable>
              <View>
                <Text className="text-3xl font-bold text-gray-900">
                  Variance Analysis
                </Text>
                <Text className="text-lg text-gray-600">
                  Theoretical vs Actual Inventory
                </Text>
              </View>
            </View>
            
            {report && (
              <Pressable
                onPress={exportSpreadsheet}
                className="bg-green-600 rounded-lg py-2 px-4 active:bg-green-700"
              >
                <Text className="text-white font-medium">Export</Text>
              </Pressable>
            )}
          </View>

          {/* Period Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Analysis Period
            </Text>
            <View className="flex-row space-x-2">
              {[1, 7, 14, 30].map((days) => (
                <Pressable
                  key={days}
                  onPress={() => setSelectedPeriod(days)}
                  className={cn(
                    "px-4 py-2 rounded-lg border",
                    selectedPeriod === days
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-200"
                  )}
                >
                  <Text className={cn(
                    "font-medium",
                    selectedPeriod === days ? "text-white" : "text-gray-700"
                  )}>
                    {days} day{days > 1 ? "s" : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Inventory Count Input */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Physical Count
              </Text>
              <Pressable
                onPress={runVarianceAnalysis}
                disabled={isAnalyzing}
                className={cn(
                  "rounded-lg py-2 px-4",
                  isAnalyzing ? "bg-gray-400" : "bg-blue-600 active:bg-blue-700"
                )}
              >
                <Text className="text-white font-medium">
                  {isAnalyzing ? "Analyzing..." : "Analyze Variance"}
                </Text>
              </Pressable>
            </View>

            <View className="bg-white rounded-xl shadow-sm border border-gray-100">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Enter actual counted quantities for each item:
                </Text>
              </View>
              
              <ScrollView className="max-h-64">
                {items.map((item, index) => (
                  <View 
                    key={item.id} 
                    className={cn(
                      "flex-row items-center justify-between p-4",
                      index < items.length - 1 ? "border-b border-gray-50" : ""
                    )}
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Current: {item.currentStock} {item.unit}
                      </Text>
                    </View>
                    <View className="w-24">
                      <TextInput
                        value={currentCounts[item.id] || ""}
                        onChangeText={(value) => handleCountChange(item.id, value)}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        className="text-right bg-gray-50 rounded-lg px-3 py-2 text-gray-900 border border-gray-200 text-sm"
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Report Summary */}
          {report && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Analysis Results
              </Text>
              
              <View className="grid grid-cols-2 gap-4 mb-4">
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <Text className="text-sm text-gray-600">Total Value Variance</Text>
                  <Text className={cn(
                    "text-2xl font-bold",
                    report.totalValueVariance >= 0 ? "text-red-600" : "text-green-600"
                  )}>
                    ${Math.abs(report.totalValueVariance).toFixed(2)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {report.totalValueVariance >= 0 ? "Loss" : "Gain"}
                  </Text>
                </View>
                
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <Text className="text-sm text-gray-600">Items with Variance</Text>
                  <Text className="text-2xl font-bold text-gray-900">
                    {report.itemsWithVariance}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    of {report.totalItems} items
                  </Text>
                </View>
              </View>

              {/* Alert Sections */}
              {report.suspectedTheft.length > 0 && (
                <View className="bg-red-50 rounded-xl p-4 border border-red-200 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="warning" size={20} color="#DC2626" />
                    <Text className="text-red-900 font-semibold ml-2">
                      Suspected Theft ({report.suspectedTheft.length} items)
                    </Text>
                  </View>
                  <Text className="text-red-800 text-sm">
                    {report.suspectedTheft.map(item => item.itemName).join(", ")}
                  </Text>
                </View>
              )}

              {report.portionControlIssues.length > 0 && (
                <View className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="scale" size={20} color="#EA580C" />
                    <Text className="text-orange-900 font-semibold ml-2">
                      Portion Control Issues ({report.portionControlIssues.length} items)
                    </Text>
                  </View>
                  <Text className="text-orange-800 text-sm">
                    {report.portionControlIssues.map(item => item.itemName).join(", ")}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Variance Details */}
          {variances.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Variance Details
                </Text>
                <Pressable
                  onPress={() => setShowDetailedView(!showDetailedView)}
                  className="bg-gray-100 rounded-lg py-2 px-3"
                >
                  <Text className="text-gray-700 text-sm font-medium">
                    {showDetailedView ? "Simple View" : "Detailed View"}
                  </Text>
                </Pressable>
              </View>

              <View className="space-y-3">
                {variances.map((variance) => (
                  <Pressable
                    key={variance.itemId}
                    onPress={() => setSelectedVariance(variance)}
                    className={cn(
                      "rounded-xl p-4 border",
                      getVarianceBgColor(variance)
                    )}
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">
                          {variance.itemName}
                        </Text>
                        <Text className="text-sm text-gray-600 capitalize">
                          {variance.category}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className={cn("font-bold", getVarianceColor(variance))}>
                          {formatVariancePercent(variance.quantityVariancePercent)}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          ${Math.abs(variance.valueVariance).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between text-sm">
                      <View>
                        <Text className="text-gray-600">
                          Theoretical: {variance.theoreticalQuantity.toFixed(1)} {variance.unit}
                        </Text>
                        <Text className="text-gray-600">
                          Actual: {variance.actualQuantity.toFixed(1)} {variance.unit}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          variance.severityLevel === "critical" ? "bg-red-100 text-red-800" :
                          variance.severityLevel === "high" ? "bg-orange-100 text-orange-800" :
                          variance.severityLevel === "medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        )}>
                          {variance.severityLevel.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {showDetailedView && (
                      <View className="mt-3 pt-3 border-t border-gray-200">
                        <Text className="text-xs text-gray-600 mb-1">
                          <Text className="font-medium">Possible Causes:</Text> {variance.possibleCauses.join(", ")}
                        </Text>
                        <Text className="text-xs text-gray-600">
                          <Text className="font-medium">Recommendations:</Text> {variance.recommendations.join(", ")}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Recommendations */}
          {report && (report.immediateActions.length > 0 || report.processImprovements.length > 0) && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Recommendations
              </Text>
              
              {report.immediateActions.length > 0 && (
                <View className="bg-red-50 rounded-xl p-4 border border-red-200 mb-3">
                  <Text className="font-semibold text-red-900 mb-2">
                    Immediate Actions Required
                  </Text>
                  {report.immediateActions.map((action, index) => (
                    <Text key={index} className="text-red-800 text-sm mb-1">
                      • {action}
                    </Text>
                  ))}
                </View>
              )}

              {report.processImprovements.length > 0 && (
                <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <Text className="font-semibold text-blue-900 mb-2">
                    Process Improvements
                  </Text>
                  {report.processImprovements.map((improvement, index) => (
                    <Text key={index} className="text-blue-800 text-sm mb-1">
                      • {improvement}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};