import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePLStore } from "../state/plStore";
import { PLCard } from "../components/PLCard";
import { InputCard } from "../components/InputCard";
import { NotificationCard } from "../components/NotificationCard";
import { MonthSelector } from "../components/MonthSelector";
import { lightHaptic } from "../utils/haptics";

interface PLDashboardScreenProps {
  onEditTargets: () => void;
  onInventory?: () => void;
  onAnalytics?: () => void;
  onSettings?: () => void;
  onRecipes?: () => void;
  onVariance?: () => void;
}

export const PLDashboardScreen: React.FC<PLDashboardScreenProps> = ({ 
  onEditTargets, 
  onInventory, 
  onAnalytics,
  onSettings,
  onRecipes,
  onVariance
}) => {
  const [showActuals, setShowActuals] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  const targets = usePLStore((state) => state.targets);
  const actuals = usePLStore((state) => state.actuals);
  const calculations = usePLStore((state) => state.calculations);
  const setActuals = usePLStore((state) => state.setActuals);
  const saveCurrentMonth = usePLStore((state) => state.saveCurrentMonth);

  const updateActual = (field: keyof typeof actuals, value: number) => {
    setActuals({ ...actuals, [field]: value });
  };

  const hasActualData = actuals.actualRevenue > 0 || actuals.actualFoodCost > 0 || 
                       actuals.actualLaborCost > 0 || actuals.actualOverhead > 0;

  const generateAlerts = () => {
    const alerts = [];
    
    if (hasActualData && calculations) {
      // High food cost warning
      if (calculations.actualFoodCostPercentage > targets.foodCostPercentage + 5) {
        alerts.push({
          id: "food-cost-high",
          title: "Food Cost Alert",
          message: `Your food cost is ${calculations.actualFoodCostPercentage.toFixed(1)}%, which is ${(calculations.actualFoodCostPercentage - targets.foodCostPercentage).toFixed(1)}% above your target.`,
          type: "warning" as const,
          actionText: "Review Inventory",
          action: onInventory,
        });
      }

      // High labor cost warning
      if (calculations.actualLaborCostPercentage > targets.laborCostPercentage + 3) {
        alerts.push({
          id: "labor-cost-high",
          title: "Labor Cost Alert", 
          message: `Your labor cost is ${calculations.actualLaborCostPercentage.toFixed(1)}%, exceeding your target by ${(calculations.actualLaborCostPercentage - targets.laborCostPercentage).toFixed(1)}%.`,
          type: "warning" as const,
        });
      }

      // Low profit margin warning
      if (calculations.actualProfitMargin < targets.targetProfitMargin - 5) {
        alerts.push({
          id: "profit-margin-low",
          title: "Low Profit Margin",
          message: `Your profit margin is ${calculations.actualProfitMargin.toFixed(1)}%, significantly below your ${targets.targetProfitMargin}% target.`,
          type: "error" as const,
          actionText: "View Analytics",
          action: onAnalytics,
        });
      }

      // Positive performance
      if (calculations.actualProfitMargin >= targets.targetProfitMargin) {
        alerts.push({
          id: "performance-good",
          title: "Great Performance!",
          message: `You&apos;re meeting your profit target with ${calculations.actualProfitMargin.toFixed(1)}% margin. Keep it up!`,
          type: "success" as const,
        });
      }
    }

    // Monthly data save reminder
    if (hasActualData && !dismissedAlerts.includes("save-reminder")) {
      alerts.push({
        id: "save-reminder",
        title: "Save Your Data",
        message: "Remember to save your monthly data for historical tracking and analytics.",
        type: "info" as const,
        actionText: "Save Month",
        action: () => {
          saveCurrentMonth();
          setDismissedAlerts(prev => [...prev, "save-reminder"]);
        },
      });
    }

    return alerts.filter(alert => !dismissedAlerts.includes(alert.id));
  };

  const alerts = generateAlerts();

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900">
                P&L Dashboard
              </Text>
              <View className="flex-row items-center mt-2">
                <MonthSelector />
                {onSettings && (
                  <Pressable 
                    onPress={() => {
                      lightHaptic();
                      onSettings();
                    }} 
                    className="ml-3 p-2"
                  >
                    <Ionicons name="settings" size={20} color="#6B7280" />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-6">
            <View className="flex-row space-x-2 mb-2">
              <Pressable
                onPress={() => {
                  lightHaptic();
                  onEditTargets();
                }}
                className="flex-1 bg-blue-600 rounded-lg py-3 active:bg-blue-700"
              >
                <Text className="text-white font-medium text-center">Edit Targets</Text>
              </Pressable>
              {onInventory && (
                <Pressable
                  onPress={() => {
                    lightHaptic();
                    onInventory();
                  }}
                  className="flex-1 bg-green-600 rounded-lg py-3 active:bg-green-700"
                >
                  <Text className="text-white font-medium text-center">Inventory</Text>
                </Pressable>
              )}
            </View>
            <View className="flex-row space-x-2">
              {onAnalytics && (
                <Pressable
                  onPress={() => {
                    lightHaptic();
                    onAnalytics();
                  }}
                  className="flex-1 bg-purple-600 rounded-lg py-3 active:bg-purple-700"
                >
                  <Text className="text-white font-medium text-center">Analytics</Text>
                </Pressable>
              )}
              {onRecipes && (
                <Pressable
                  onPress={() => {
                    lightHaptic();
                    onRecipes();
                  }}
                  className="flex-1 bg-orange-600 rounded-lg py-3 active:bg-orange-700"
                >
                  <Text className="text-white font-medium text-center">Recipes</Text>
                </Pressable>
              )}
              {onVariance && (
                <Pressable
                  onPress={() => {
                    lightHaptic();
                    onVariance();
                  }}
                  className="flex-1 bg-red-600 rounded-lg py-3 active:bg-red-700"
                >
                  <Text className="text-white font-medium text-center">Variance</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Alerts */}
          {alerts.length > 0 && (
            <View className="mb-6">
              {alerts.map((alert) => (
                <NotificationCard
                  key={alert.id}
                  title={alert.title}
                  message={alert.message}
                  type={alert.type}
                  onDismiss={() => handleDismissAlert(alert.id)}
                  onAction={alert.action}
                  actionText={alert.actionText}
                />
              ))}
            </View>
          )}

          {/* Target Summary Cards */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Targets
            </Text>
            <View className="grid grid-cols-2 gap-4 mb-4">
              <PLCard
                title="Revenue Target"
                value={targets.monthlyRevenue}
                icon="trending-up"
                valueColor="blue"
              />
              <PLCard
                title="Profit Target"
                value={calculations?.targetProfit || 0}
                percentage={targets.targetProfitMargin}
                icon="analytics"
                valueColor="green"
              />
            </View>
            <View className="grid grid-cols-3 gap-3">
              <PLCard
                title="Food Cost"
                value={calculations?.targetFoodCost || 0}
                percentage={targets.foodCostPercentage}
                icon="restaurant"
                valueColor="amber"
                className="col-span-1"
              />
              <PLCard
                title="Labor Cost"
                value={calculations?.targetLaborCost || 0}
                percentage={targets.laborCostPercentage}
                icon="people"
                valueColor="amber"
                className="col-span-1"
              />
              <PLCard
                title="Overhead"
                value={calculations?.targetOverhead || 0}
                percentage={targets.overheadPercentage}
                icon="business"
                valueColor="amber"
                className="col-span-1"
              />
            </View>
          </View>

          {/* Actuals Input Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Actual Performance
              </Text>
              <Pressable
                onPress={() => setShowActuals(!showActuals)}
                className="flex-row items-center space-x-1"
              >
                <Text className="text-blue-600 font-medium">
                  {showActuals ? "Hide" : "Enter Actuals"}
                </Text>
                <Ionicons
                  name={showActuals ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#2563EB"
                />
              </Pressable>
            </View>

            {showActuals && (
              <View className="space-y-4 mb-6">
                <InputCard
                  title="Actual Revenue"
                  value={actuals.actualRevenue}
                  onValueChange={(value) => updateActual("actualRevenue", value)}
                  placeholder="Enter actual revenue"
                  icon="cash"
                  inputType="currency"
                />
                <InputCard
                  title="Actual Food Cost"
                  value={actuals.actualFoodCost}
                  onValueChange={(value) => updateActual("actualFoodCost", value)}
                  placeholder="Enter actual food costs"
                  icon="restaurant"
                  inputType="currency"
                />
                <InputCard
                  title="Actual Labor Cost"
                  value={actuals.actualLaborCost}
                  onValueChange={(value) => updateActual("actualLaborCost", value)}
                  placeholder="Enter actual labor costs"
                  icon="people"
                  inputType="currency"
                />
                <InputCard
                  title="Actual Overhead"
                  value={actuals.actualOverhead}
                  onValueChange={(value) => updateActual("actualOverhead", value)}
                  placeholder="Enter actual overhead"
                  icon="business"
                  inputType="currency"
                />
              </View>
            )}
          </View>

          {/* Performance Analysis */}
          {hasActualData && calculations && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Performance Analysis
              </Text>
              
              {/* Key Metrics */}
              <View className="grid grid-cols-2 gap-4 mb-4">
                <PLCard
                  title="Actual Revenue"
                  value={actuals.actualRevenue}
                  variance={actuals.actualRevenue - targets.monthlyRevenue}
                  icon="cash"
                  valueColor={actuals.actualRevenue >= targets.monthlyRevenue ? "green" : "red"}
                />
                <PLCard
                  title="Actual Profit"
                  value={calculations.actualProfit}
                  percentage={calculations.actualProfitMargin}
                  variance={calculations.varianceProfit}
                  icon="analytics"
                  valueColor={calculations.actualProfit > 0 ? "green" : "red"}
                />
              </View>

              {/* Cost Breakdown */}
              <View className="grid grid-cols-3 gap-3 mb-6">
                <PLCard
                  title="Food Cost"
                  value={actuals.actualFoodCost}
                  percentage={calculations.actualFoodCostPercentage}
                  variance={calculations.varianceFoodCost}
                  valueColor={calculations.actualFoodCostPercentage <= targets.foodCostPercentage ? "green" : "red"}
                  className="col-span-1"
                />
                <PLCard
                  title="Labor Cost"
                  value={actuals.actualLaborCost}
                  percentage={calculations.actualLaborCostPercentage}
                  variance={calculations.varianceLaborCost}
                  valueColor={calculations.actualLaborCostPercentage <= targets.laborCostPercentage ? "green" : "red"}
                  className="col-span-1"
                />
                <PLCard
                  title="Overhead"
                  value={actuals.actualOverhead}
                  percentage={calculations.actualOverheadPercentage}
                  variance={calculations.varianceOverhead}
                  valueColor={calculations.actualOverheadPercentage <= targets.overheadPercentage ? "green" : "red"}
                  className="col-span-1"
                />
              </View>

              {/* Performance Summary */}
              <View className={`rounded-xl p-4 border ${
                calculations.actualProfitMargin >= targets.targetProfitMargin 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <View className="flex-row items-center mb-2">
                  <Ionicons 
                    name={calculations.actualProfitMargin >= targets.targetProfitMargin ? "checkmark-circle" : "warning"} 
                    size={24} 
                    color={calculations.actualProfitMargin >= targets.targetProfitMargin ? "#059669" : "#DC2626"} 
                  />
                  <Text className={`text-lg font-semibold ml-2 ${
                    calculations.actualProfitMargin >= targets.targetProfitMargin 
                      ? "text-green-900" 
                      : "text-red-900"
                  }`}>
                    {calculations.actualProfitMargin >= targets.targetProfitMargin 
                      ? "On Track!" 
                      : "Needs Attention"}
                  </Text>
                </View>
                <Text className={
                  calculations.actualProfitMargin >= targets.targetProfitMargin 
                    ? "text-green-800" 
                    : "text-red-800"
                }>
                  {calculations.actualProfitMargin >= targets.targetProfitMargin 
                    ? `Your profit margin of ${calculations.actualProfitMargin.toFixed(1)}% meets your ${targets.targetProfitMargin}% target.`
                    : `Your profit margin of ${calculations.actualProfitMargin.toFixed(1)}% is below your ${targets.targetProfitMargin}% target. Consider reducing costs or increasing revenue.`}
                </Text>
              </View>
            </View>
          )}

          {/* Get Started Message */}
          {!hasActualData && (
            <View className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <View className="items-center">
                <Ionicons name="analytics" size={48} color="#2563EB" />
                <Text className="text-xl font-semibold text-blue-900 mt-4 mb-2">
                  Ready to Track Performance?
                </Text>
                <Text className="text-blue-800 text-center mb-4">
                  Enter your actual revenue and costs to see how you are performing against your targets.
                </Text>
                <Pressable
                  onPress={() => setShowActuals(true)}
                  className="bg-blue-600 rounded-lg py-3 px-6 active:bg-blue-700"
                >
                  <Text className="text-white font-semibold">Enter Actual Data</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};