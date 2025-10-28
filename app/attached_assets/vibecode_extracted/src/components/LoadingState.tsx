import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  Easing
} from "react-native-reanimated";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = "medium" 
}) => {
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const getSize = () => {
    switch (size) {
      case "small": return 20;
      case "large": return 40;
      default: return 28;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small": return "p-2";
      case "large": return "p-8";
      default: return "p-4";
    }
  };

  return (
    <View className={`items-center justify-center ${getPadding()}`}>
      <Animated.View style={animatedStyle}>
        <Ionicons 
          name="refresh" 
          size={getSize()} 
          color="#6366F1" 
        />
      </Animated.View>
      <Text className="text-gray-600 mt-2 text-center">
        {message}
      </Text>
    </View>
  );
};