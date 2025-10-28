import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePLStore } from "../state/plStore";
import { InputCard } from "../components/InputCard";
import { lightHaptic, successHaptic } from "../utils/haptics";

interface PLTargetsScreenProps {
  onNext: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PLTargetsScreen: React.FC<PLTargetsScreenProps> = ({ onNext, showBackButton = false, onBack }) => {
  const targets = usePLStore((state) => state.targets);
  const setTargets = usePLStore((state) => state.setTargets);
  const currentMonth = usePLStore((state) => state.currentMonth);

  const updateTarget = (field: keyof typeof targets, value: number) => {
    setTargets({ ...targets, [field]: value });
  };

  const isFormValid = () => {
    return targets.monthlyRevenue > 0 && 
           targets.foodCostPercentage > 0 && 
           targets.laborCostPercentage > 0 && 
           targets.overheadPercentage > 0 && 
           targets.targetProfitMargin > 0;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Header */}
          <View className="mb-8">
            {showBackButton && onBack && (
              <View className="flex-row items-center mb-4">
                <Pressable
                  onPress={() => {
                    lightHaptic();
                    onBack();
                  }}
                  className="mr-3 p-2 rounded-lg bg-white border border-gray-200"
                >
                  <Ionicons name="arrow-back" size={20} color="#374151" />
                </Pressable>
                <Text className="text-lg text-gray-600">Back to Dashboard</Text>
              </View>
            )}
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {showBackButton ? "Edit Your Targets" : "Set Your Targets"}
            </Text>
            <Text className="text-lg text-gray-600">
              {currentMonth}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {showBackButton 
                ? "Update your financial goals for this month"
                : "Enter your financial goals for this month"
              }
            </Text>
          </View>

          {/* Revenue Target */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Target
            </Text>
            <InputCard
              title="Monthly Revenue Goal"
              value={targets.monthlyRevenue}
              onValueChange={(value) => updateTarget("monthlyRevenue", value)}
              placeholder="Enter target revenue"
              icon="trending-up"
              inputType="currency"
            />
          </View>

          {/* Cost Percentages */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Cost Structure (% of Revenue)
            </Text>
            <View className="space-y-4">
              <InputCard
                title="Food Cost %"
                value={targets.foodCostPercentage}
                onValueChange={(value) => updateTarget("foodCostPercentage", value)}
                placeholder="30"
                icon="restaurant"
                inputType="percentage"
              />
              
              <InputCard
                title="Labor Cost %"
                value={targets.laborCostPercentage}
                onValueChange={(value) => updateTarget("laborCostPercentage", value)}
                placeholder="25"
                icon="people"
                inputType="percentage"
              />
              
              <InputCard
                title="Overhead %"
                value={targets.overheadPercentage}
                onValueChange={(value) => updateTarget("overheadPercentage", value)}
                placeholder="20"
                icon="business"
                inputType="percentage"
              />
            </View>
          </View>

          {/* Profit Margin */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Profit Target
            </Text>
            <InputCard
              title="Target Profit Margin %"
              value={targets.targetProfitMargin}
              onValueChange={(value) => updateTarget("targetProfitMargin", value)}
              placeholder="25"
              icon="analytics"
              inputType="percentage"
            />
          </View>

          {/* Summary Card */}
          {targets.monthlyRevenue > 0 && (
            <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <Text className="text-lg font-semibold text-blue-900 mb-2">
                Target Summary
              </Text>
              <View className="space-y-1">
                <Text className="text-blue-800">
                  Revenue: ${targets.monthlyRevenue.toLocaleString()}
                </Text>
                <Text className="text-blue-800">
                  Food Cost: ${Math.round((targets.monthlyRevenue * targets.foodCostPercentage) / 100).toLocaleString()} ({targets.foodCostPercentage}%)
                </Text>
                <Text className="text-blue-800">
                  Labor Cost: ${Math.round((targets.monthlyRevenue * targets.laborCostPercentage) / 100).toLocaleString()} ({targets.laborCostPercentage}%)
                </Text>
                <Text className="text-blue-800">
                  Overhead: ${Math.round((targets.monthlyRevenue * targets.overheadPercentage) / 100).toLocaleString()} ({targets.overheadPercentage}%)
                </Text>
                <Text className="text-blue-900 font-semibold mt-2">
                  Target Profit: ${Math.round((targets.monthlyRevenue * targets.targetProfitMargin) / 100).toLocaleString()} ({targets.targetProfitMargin}%)
                </Text>
              </View>
            </View>
          )}

          {/* Continue Button */}
          <Pressable
            onPress={() => {
              if (isFormValid()) {
                successHaptic();
                onNext();
              }
            }}
            disabled={!isFormValid()}
            className={`rounded-xl py-4 px-6 flex-row items-center justify-center space-x-2 ${
              isFormValid() 
                ? "bg-blue-600 active:bg-blue-700" 
                : "bg-gray-300"
            }`}
          >
            <Text className={`text-lg font-semibold ${
              isFormValid() ? "text-white" : "text-gray-500"
            }`}>
              {showBackButton ? "Save Changes" : "Continue to Dashboard"}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={isFormValid() ? "#ffffff" : "#9CA3AF"} 
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};