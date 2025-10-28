import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { PLTargetsScreen } from "./src/screens/PLTargetsScreen";
import { PLDashboardScreen } from "./src/screens/PLDashboardScreen";
import { InventoryScreen } from "./src/screens/InventoryScreen";
import { AnalyticsScreen } from "./src/screens/AnalyticsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { RecipeMappingScreen } from "./src/screens/RecipeMappingScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { VarianceAnalysisScreen } from "./src/screens/VarianceAnalysisScreen";
import { usePLStore } from "./src/state/plStore";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

type AppScreen = "onboarding" | "targets" | "dashboard" | "inventory" | "analytics" | "settings" | "recipes" | "variance";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("onboarding");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  
  const targets = usePLStore((state) => state.targets);
  const restaurantName = usePLStore((state) => state.restaurantName);

  // Check if user has set targets
  const hasTargets = targets.monthlyRevenue > 0;

  // Check if user has completed onboarding
  React.useEffect(() => {
    if (restaurantName && !hasCompletedOnboarding) {
      setHasCompletedOnboarding(true);
      setCurrentScreen("targets");
    }
  }, [restaurantName, hasCompletedOnboarding]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "onboarding":
        return (
          <OnboardingScreen 
            onComplete={() => {
              setHasCompletedOnboarding(true);
              setCurrentScreen("targets");
            }}
          />
        );
      case "targets":
        return (
          <PLTargetsScreen 
            onNext={() => {
              setIsEditingTargets(false);
              setCurrentScreen("dashboard");
            }}
            showBackButton={isEditingTargets}
            onBack={() => {
              setIsEditingTargets(false);
              setCurrentScreen("dashboard");
            }}
          />
        );
      case "dashboard":
        return (
          <PLDashboardScreen 
            onEditTargets={() => {
              setIsEditingTargets(true);
              setCurrentScreen("targets");
            }}
            onInventory={() => setCurrentScreen("inventory")}
            onAnalytics={() => setCurrentScreen("analytics")}
            onSettings={() => setCurrentScreen("settings")}
            onRecipes={() => setCurrentScreen("recipes")}
            onVariance={() => setCurrentScreen("variance")}
          />
        );
      case "inventory":
        return (
          <InventoryScreen 
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "analytics":
        return (
          <AnalyticsScreen 
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "settings":
        return (
          <SettingsScreen 
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "recipes":
        return (
          <RecipeMappingScreen 
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "variance":
        return (
          <VarianceAnalysisScreen 
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      default:
        return (
          <PLTargetsScreen 
            onNext={() => setCurrentScreen("dashboard")} 
          />
        );
    }
  };

  // Auto-navigate to dashboard if targets are set (but not when editing)
  React.useEffect(() => {
    if (hasTargets && currentScreen === "targets" && !isEditingTargets) {
      setCurrentScreen("dashboard");
    }
  }, [hasTargets, currentScreen, isEditingTargets]);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <NavigationContainer>
            {renderScreen()}
            <StatusBar style="auto" />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}