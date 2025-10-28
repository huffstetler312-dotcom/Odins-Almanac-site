import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCard } from "../components/AnimatedCard";
import { usePLStore } from "../state/plStore";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [restaurantName, setRestaurantName] = useState("");
  
  const setRestaurantNameStore = usePLStore((state) => state.setRestaurantName);

  const steps = [
    {
      title: "Welcome to P&L Manager",
      subtitle: "Your complete restaurant financial management solution",
      content: (
        <View className="items-center py-8">
          <Ionicons name="restaurant" size={80} color="#3B82F6" />
          <Text className="text-lg text-gray-600 mt-6 text-center leading-relaxed">
            Track your profit & loss, manage inventory, and optimize your restaurant&apos;s financial performance with ease.
          </Text>
        </View>
      ),
    },
    {
      title: "Set Your Restaurant Name",
      subtitle: "Let's personalize your experience",
      content: (
        <View className="py-8">
          <View className="items-center mb-8">
            <Ionicons name="storefront" size={60} color="#10B981" />
          </View>
          <Text className="text-gray-600 mb-4 text-center">
            What&apos;s the name of your restaurant?
          </Text>
          <TextInput
            value={restaurantName}
            onChangeText={setRestaurantName}
            placeholder="Enter your restaurant name"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg text-center"
            autoFocus
          />
        </View>
      ),
    },
    {
      title: "Key Features",
      subtitle: "Everything you need to stay profitable",
      content: (
        <View className="py-4">
          <View className="space-y-4">
            <FeatureItem
              icon="analytics"
              title="P&L Tracking"
              description="Set targets and track actual performance with real-time calculations"
            />
            <FeatureItem
              icon="cube"
              title="Inventory Management"
              description="Monitor stock levels and generate smart purchase orders"
            />
            <FeatureItem
              icon="restaurant"
              title="Recipe Costing"
              description="Calculate recipe costs and optimize menu pricing"
            />
            <FeatureItem
              icon="bar-chart"
              title="Analytics & Reports"
              description="Historical trends and performance insights"
            />
            <FeatureItem
              icon="cloud-upload"
              title="Data Backup"
              description="Secure backup and restore functionality"
            />
          </View>
        </View>
      ),
    },
    {
      title: "You're All Set!",
      subtitle: "Ready to optimize your restaurant's profitability",
      content: (
        <View className="items-center py-8">
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text className="text-lg text-gray-600 mt-6 text-center leading-relaxed">
            Start by setting your monthly targets and tracking your actual performance. 
            Let&apos;s make your restaurant more profitable!
          </Text>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === 1 && restaurantName.trim()) {
      setRestaurantNameStore(restaurantName.trim());
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return restaurantName.trim().length > 0;
    }
    return true;
  };

  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <View className="flex-1 px-6 py-8">
        {/* Progress Indicators */}
        <View className="flex-row justify-center mb-8">
          {steps.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-8 rounded-full mx-1 ${
                index <= currentStep ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          ))}
        </View>

        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <AnimatedCard className="p-6" delay={100}>
            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
              {currentStepData.title}
            </Text>
            <Text className="text-lg text-gray-600 text-center mb-6">
              {currentStepData.subtitle}
            </Text>
            {currentStepData.content}
          </AnimatedCard>
        </ScrollView>

        {/* Navigation */}
        <View className="flex-row justify-between items-center pt-6">
          <Pressable
            onPress={handleBack}
            disabled={currentStep === 0}
            className={`flex-row items-center py-3 px-4 rounded-lg ${
              currentStep === 0 
                ? "opacity-50" 
                : "bg-gray-100 active:bg-gray-200"
            }`}
          >
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
            <Text className="text-gray-600 ml-1">Back</Text>
          </Pressable>

          <Text className="text-gray-500">
            {currentStep + 1} of {steps.length}
          </Text>

          <Pressable
            onPress={handleNext}
            disabled={!canProceed()}
            className={`flex-row items-center py-3 px-6 rounded-lg ${
              canProceed()
                ? "bg-blue-600 active:bg-blue-700"
                : "bg-gray-300"
            }`}
          >
            <Text className={`font-medium mr-1 ${
              canProceed() ? "text-white" : "text-gray-500"
            }`}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Text>
            <Ionicons 
              name={currentStep === steps.length - 1 ? "rocket" : "chevron-forward"} 
              size={20} 
              color={canProceed() ? "#ffffff" : "#9CA3AF"} 
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <View className="flex-row items-start">
    <View className="bg-blue-100 rounded-full p-3 mr-4">
      <Ionicons name={icon} size={24} color="#3B82F6" />
    </View>
    <View className="flex-1">
      <Text className="font-semibold text-gray-900 mb-1">{title}</Text>
      <Text className="text-gray-600 text-sm leading-relaxed">{description}</Text>
    </View>
  </View>
);