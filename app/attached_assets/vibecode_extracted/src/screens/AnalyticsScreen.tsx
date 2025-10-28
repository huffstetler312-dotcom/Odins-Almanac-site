import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePLStore } from "../state/plStore";
import { PLCard } from "../components/PLCard";

interface AnalyticsScreenProps {
  onBack: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"3" | "6" | "12">("6");
  
  const historicalData = usePLStore((state) => state.historicalData);
  const exportData = usePLStore((state) => state.exportData);
  const restaurantName = usePLStore((state) => state.restaurantName);

  const periodData = historicalData.slice(0, parseInt(selectedPeriod));

  const calculateTrends = () => {
    if (periodData.length < 2) return null;

    const latest = periodData[0];
    const previous = periodData[1];

    return {
      revenueChange: latest.calculations.actualProfit - previous.calculations.actualProfit,
      profitMarginChange: latest.calculations.actualProfitMargin - previous.calculations.actualProfitMargin,
      foodCostChange: latest.calculations.actualFoodCostPercentage - previous.calculations.actualFoodCostPercentage,
      laborCostChange: latest.calculations.actualLaborCostPercentage - previous.calculations.actualLaborCostPercentage,
    };
  };

  const calculateAverages = () => {
    if (periodData.length === 0) return null;

    const totals = periodData.reduce((acc, data) => ({
      revenue: acc.revenue + data.actuals.actualRevenue,
      profit: acc.profit + data.calculations.actualProfit,
      profitMargin: acc.profitMargin + data.calculations.actualProfitMargin,
      foodCost: acc.foodCost + data.calculations.actualFoodCostPercentage,
      laborCost: acc.laborCost + data.calculations.actualLaborCostPercentage,
      overheadCost: acc.overheadCost + data.calculations.actualOverheadPercentage,
    }), { revenue: 0, profit: 0, profitMargin: 0, foodCost: 0, laborCost: 0, overheadCost: 0 });

    const count = periodData.length;

    return {
      avgRevenue: totals.revenue / count,
      avgProfit: totals.profit / count,
      avgProfitMargin: totals.profitMargin / count,
      avgFoodCost: totals.foodCost / count,
      avgLaborCost: totals.laborCost / count,
      avgOverheadCost: totals.overheadCost / count,
    };
  };

  const getBestAndWorstMonths = () => {
    if (periodData.length === 0) return null;

    const sorted = [...periodData].sort((a, b) => b.calculations.actualProfit - a.calculations.actualProfit);
    
    return {
      bestMonth: sorted[0],
      worstMonth: sorted[sorted.length - 1],
    };
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      const data = exportData(format);
      
      await Share.share({
        message: data,
        title: `P&L Report - ${restaurantName || "Restaurant"}`,
      });
    } catch (error) {
      Alert.alert("Export Error", "Failed to export data. Please try again.");
    }
  };

  const trends = calculateTrends();
  const averages = calculateAverages();
  const bestWorst = getBestAndWorstMonths();

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
                  Analytics
                </Text>
                <Text className="text-lg text-gray-600">
                  Performance insights
                </Text>
              </View>
            </View>
            
            <View className="flex-row space-x-2">
              <Pressable
                onPress={() => handleExport("csv")}
                className="bg-green-600 rounded-lg py-2 px-3 active:bg-green-700"
              >
                <Ionicons name="document-text" size={20} color="white" />
              </Pressable>
              <Pressable
                onPress={() => handleExport("json")}
                className="bg-blue-600 rounded-lg py-2 px-3 active:bg-blue-700"
              >
                <Ionicons name="download" size={20} color="white" />
              </Pressable>
            </View>
          </View>

          {historicalData.length === 0 ? (
            <View className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <View className="items-center">
                <Ionicons name="bar-chart" size={48} color="#2563EB" />
                <Text className="text-xl font-semibold text-blue-900 mt-4 mb-2">
                  No Data Available
                </Text>
                <Text className="text-blue-800 text-center">
                  Complete a few months of P&L data to see analytics and trends.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Period Selection */}
              <View className="flex-row bg-white rounded-xl p-1 mb-6 border border-gray-200">
                {(["3", "6", "12"] as const).map((period) => (
                  <Pressable
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    className={`flex-1 py-2 rounded-lg ${
                      selectedPeriod === period
                        ? "bg-blue-600"
                        : "bg-transparent"
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      selectedPeriod === period
                        ? "text-white"
                        : "text-gray-600"
                    }`}>
                      {period} Months
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Averages */}
              {averages && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedPeriod}-Month Averages
                  </Text>
                  <View className="grid grid-cols-2 gap-4 mb-4">
                    <PLCard
                      title="Avg Revenue"
                      value={averages.avgRevenue}
                      icon="trending-up"
                      valueColor="blue"
                    />
                    <PLCard
                      title="Avg Profit"
                      value={averages.avgProfit}
                      percentage={averages.avgProfitMargin}
                      icon="analytics"
                      valueColor="green"
                    />
                  </View>
                  <View className="grid grid-cols-3 gap-3">
                    <PLCard
                      title="Avg Food Cost"
                      value=""
                      percentage={averages.avgFoodCost}
                      icon="restaurant"
                      valueColor="amber"
                    />
                    <PLCard
                      title="Avg Labor Cost"
                      value=""
                      percentage={averages.avgLaborCost}
                      icon="people"
                      valueColor="amber"
                    />
                    <PLCard
                      title="Avg Overhead"
                      value=""
                      percentage={averages.avgOverheadCost}
                      icon="business"
                      valueColor="amber"
                    />
                  </View>
                </View>
              )}

              {/* Trends */}
              {trends && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">
                    Month-over-Month Trends
                  </Text>
                  <View className="grid grid-cols-2 gap-4">
                    <PLCard
                      title="Profit Change"
                      value={trends.revenueChange}
                      icon="trending-up"
                      valueColor={trends.revenueChange >= 0 ? "green" : "red"}
                    />
                    <PLCard
                      title="Margin Change"
                      value=""
                      percentage={trends.profitMarginChange}
                      icon="analytics"
                      valueColor={trends.profitMarginChange >= 0 ? "green" : "red"}
                    />
                  </View>
                </View>
              )}

              {/* Best/Worst Performance */}
              {bestWorst && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">
                    Performance Highlights
                  </Text>
                  <View className="space-y-4">
                    <View className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="trophy" size={24} color="#059669" />
                        <Text className="text-green-900 font-semibold ml-2 text-lg">
                          Best Month: {bestWorst.bestMonth.month} {bestWorst.bestMonth.year}
                        </Text>
                      </View>
                      <Text className="text-green-800">
                        Profit: ${bestWorst.bestMonth.calculations.actualProfit.toLocaleString()} 
                        ({bestWorst.bestMonth.calculations.actualProfitMargin.toFixed(1)}% margin)
                      </Text>
                    </View>

                    {bestWorst.worstMonth.id !== bestWorst.bestMonth.id && (
                      <View className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <View className="flex-row items-center mb-2">
                          <Ionicons name="trending-down" size={24} color="#DC2626" />
                          <Text className="text-red-900 font-semibold ml-2 text-lg">
                            Needs Focus: {bestWorst.worstMonth.month} {bestWorst.worstMonth.year}
                          </Text>
                        </View>
                        <Text className="text-red-800">
                          Profit: ${bestWorst.worstMonth.calculations.actualProfit.toLocaleString()} 
                          ({bestWorst.worstMonth.calculations.actualProfitMargin.toFixed(1)}% margin)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Historical Data List */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Monthly History
                </Text>
                <View className="space-y-3">
                  {periodData.map((data) => (
                    <View key={data.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-lg font-semibold text-gray-900">
                          {data.month} {data.year}
                        </Text>
                        <Text className={`font-bold ${
                          data.calculations.actualProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          ${data.calculations.actualProfit.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <View>
                          <Text className="text-sm text-gray-600">
                            Revenue: ${data.actuals.actualRevenue.toLocaleString()}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            Profit Margin: {data.calculations.actualProfitMargin.toFixed(1)}%
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm text-gray-600">
                            Food: {data.calculations.actualFoodCostPercentage.toFixed(1)}%
                          </Text>
                          <Text className="text-sm text-gray-600">
                            Labor: {data.calculations.actualLaborCostPercentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};