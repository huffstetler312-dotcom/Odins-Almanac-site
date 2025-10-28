import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";
import { AnimatedCard } from "./AnimatedCard";
import { AnimatedNumber } from "./AnimatedNumber";

interface PLCardProps {
  title: string;
  value: string | number;
  percentage?: string | number;
  variance?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  className?: string;
  valueColor?: "green" | "red" | "amber" | "blue" | "gray";
  animated?: boolean;
  animationDelay?: number;
}

export const PLCard: React.FC<PLCardProps> = ({
  title,
  value,
  percentage,
  variance,
  icon,
  onPress,
  className,
  valueColor = "gray",
  animated = true,
  animationDelay = 0,
}) => {
  const formatCurrency = React.useCallback((num: number | string): string => {
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "$0";
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  }, []);

  const formatPercentage = React.useCallback((num: number | string): string => {
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "0.0%";
    return `${numValue.toFixed(1)}%`;
  }, []);

  const getVarianceColor = (variance: number): string => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance: number): keyof typeof Ionicons.glyphMap => {
    if (variance > 0) return "trending-up";
    if (variance < 0) return "trending-down";
    return "remove";
  };

  const getValueColorClass = (color: string): string => {
    switch (color) {
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "amber": return "text-amber-600";
      case "blue": return "text-blue-600";
      default: return "text-gray-900";
    }
  };

  const numericValue = typeof value === "number" ? value : 0;
  const numericPercentage = typeof percentage === "number" ? percentage : 0;

  const CardContent = () => (
    <View className="p-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium text-gray-600">{title}</Text>
        {icon && <Ionicons name={icon} size={20} color="#9CA3AF" />}
      </View>
      
      <View className="space-y-1">
        {animated && typeof value === "number" ? (
          <AnimatedNumber
            value={numericValue}
            format={formatCurrency}
            className={cn("text-2xl font-bold", getValueColorClass(valueColor))}
            delay={animationDelay}
          />
        ) : (
          <Text className={cn("text-2xl font-bold", getValueColorClass(valueColor))}>
            {typeof value === "number" ? formatCurrency(value) : value}
          </Text>
        )}
        
        {percentage !== undefined && (
          <>
            {animated && typeof percentage === "number" ? (
              <AnimatedNumber
                value={numericPercentage}
                format={formatPercentage}
                className="text-sm text-gray-500"
                delay={animationDelay + 100}
              />
            ) : (
              <Text className="text-sm text-gray-500">
                {typeof percentage === "number" ? formatPercentage(percentage) : percentage}
              </Text>
            )}
          </>
        )}
        
        {variance !== undefined && variance !== 0 && (
          <View className="flex-row items-center space-x-1">
            <Ionicons 
              name={getVarianceIcon(variance)} 
              size={14} 
              color={variance > 0 ? "#059669" : "#DC2626"} 
            />
            <Text className={cn("text-xs font-medium", getVarianceColor(variance))}>
              {Math.abs(variance) > 1000 
                ? formatCurrency(Math.abs(variance))
                : formatPercentage(Math.abs(variance))}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <AnimatedCard 
      onPress={onPress} 
      className={className}
      delay={animationDelay}
    >
      <CardContent />
    </AnimatedCard>
  );
};