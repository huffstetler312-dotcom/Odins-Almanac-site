import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface InputCardProps {
  title: string;
  value: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  suffix?: string;
  prefix?: string;
  className?: string;
  inputType?: "currency" | "percentage" | "number";
}

export const InputCard: React.FC<InputCardProps> = ({
  title,
  value,
  onValueChange,
  placeholder,
  icon,
  suffix,
  prefix,
  className,
  inputType = "number",
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChangeText = (text: string) => {
    setInputValue(text);
    const numValue = parseFloat(text.replace(/[^\d.-]/g, ""));
    if (!isNaN(numValue)) {
      onValueChange(numValue);
    } else if (text === "" || text === "0") {
      onValueChange(0);
    }
  };

  const formatDisplayValue = (val: string): string => {
    if (!val || val === "0") return "";
    
    const numValue = parseFloat(val.replace(/[^\d.-]/g, ""));
    if (isNaN(numValue)) return val;

    switch (inputType) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(numValue);
      case "percentage":
        return numValue.toString();
      default:
        return numValue.toString();
    }
  };

  const getPrefix = (): string => {
    if (prefix) return prefix;
    if (inputType === "currency") return "$";
    return "";
  };

  const getSuffix = (): string => {
    if (suffix) return suffix;
    if (inputType === "percentage") return "%";
    return "";
  };

  return (
    <Pressable onPress={() => Keyboard.dismiss()}>
      <View className={cn("bg-white rounded-xl p-4 shadow-sm border border-gray-100", className)}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-medium text-gray-600">{title}</Text>
          {icon && <Ionicons name={icon} size={20} color="#9CA3AF" />}
        </View>
        
        <View className={cn(
          "flex-row items-center bg-gray-50 rounded-lg px-3 py-2 border",
          isFocused ? "border-blue-500 bg-blue-50" : "border-gray-200"
        )}>
          {getPrefix() && (
            <Text className="text-lg font-semibold text-gray-600 mr-1">
              {getPrefix()}
            </Text>
          )}
          
          <TextInput
            value={isFocused ? inputValue : formatDisplayValue(inputValue)}
            onChangeText={handleChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className="flex-1 text-lg font-semibold text-gray-900"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          
          {getSuffix() && (
            <Text className="text-lg font-semibold text-gray-600 ml-1">
              {getSuffix()}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};