import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NotificationCardProps {
  title: string;
  message: string;
  type: "warning" | "error" | "success" | "info";
  onDismiss?: () => void;
  onAction?: () => void;
  actionText?: string;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  message,
  type,
  onDismiss,
  onAction,
  actionText,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "alert-circle" as keyof typeof Ionicons.glyphMap,
          iconColor: "#DC2626",
          titleColor: "text-red-900",
          messageColor: "text-red-800",
          actionBg: "bg-red-600",
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: "warning" as keyof typeof Ionicons.glyphMap,
          iconColor: "#D97706",
          titleColor: "text-amber-900",
          messageColor: "text-amber-800",
          actionBg: "bg-amber-600",
        };
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
          iconColor: "#059669",
          titleColor: "text-green-900",
          messageColor: "text-green-800",
          actionBg: "bg-green-600",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "information-circle" as keyof typeof Ionicons.glyphMap,
          iconColor: "#2563EB",
          titleColor: "text-blue-900",
          messageColor: "text-blue-800",
          actionBg: "bg-blue-600",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <View className={`${styles.bg} ${styles.border} rounded-xl p-4 border mb-3`}>
      <View className="flex-row items-start">
        <Ionicons 
          name={styles.icon} 
          size={24} 
          color={styles.iconColor}
          style={{ marginTop: 2 }}
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className={`font-semibold text-base ${styles.titleColor}`}>
              {title}
            </Text>
            {onDismiss && (
              <Pressable onPress={onDismiss} className="p-1">
                <Ionicons name="close" size={20} color={styles.iconColor} />
              </Pressable>
            )}
          </View>
          <Text className={`text-sm ${styles.messageColor} mb-2`}>
            {message}
          </Text>
          {onAction && actionText && (
            <Pressable
              onPress={onAction}
              className={`${styles.actionBg} rounded-lg py-2 px-4 self-start`}
            >
              <Text className="text-white font-medium text-sm">
                {actionText}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};