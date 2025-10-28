import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  interpolate
} from "react-native-reanimated";
import { cn } from "../utils/cn";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  onPress?: () => void;
  className?: string;
  style?: any;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  onPress,
  className,
  style,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const pressedStyle = useSharedValue(0);

  const handlePressIn = () => {
    if (onPress) {
      pressedStyle.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      pressedStyle.value = withSpring(0, { damping: 15, stiffness: 200 });
    }
  };

  const pressAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressedStyle.value,
      [0, 1],
      [1, 0.97],
      'clamp'
    );
    
    return {
      transform: [{ scale }],
    };
  });

  const CardContent = (
    <Animated.View
      style={[animatedStyle, pressAnimatedStyle, style]}
      className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};