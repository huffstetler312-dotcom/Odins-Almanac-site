import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InventoryItem, useInventoryStore } from "../state/inventoryStore";
import { cn } from "../utils/cn";

interface InventoryEditModalProps {
  visible: boolean;
  item: InventoryItem | null;
  onClose: () => void;
}

export const InventoryEditModal: React.FC<InventoryEditModalProps> = ({
  visible,
  item,
  onClose,
}) => {
  const { updateItem, adjustStock } = useInventoryStore();
  
  const [currentStock, setCurrentStock] = useState("");
  const [parLevel, setParLevel] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [suggestedOrder, setSuggestedOrder] = useState("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  useEffect(() => {
    if (item) {
      setCurrentStock((item.currentStock || 0).toString());
      setParLevel((item.parLevel || 0).toString());
      setCostPerUnit((item.costPerUnit || 0).toString());
      setSuggestedOrder((item.suggestedOrder || 0).toString());
      setAdjustmentQuantity("");
      setAdjustmentReason("");
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;

    const updates: Partial<InventoryItem> = {};
    
    // Update basic fields
    const newParLevel = parseFloat(parLevel);
    const newCostPerUnit = parseFloat(costPerUnit);
    const newSuggestedOrder = parseFloat(suggestedOrder);
    
    if (!isNaN(newParLevel) && newParLevel !== item.parLevel) {
      updates.parLevel = newParLevel;
    }
    
    if (!isNaN(newCostPerUnit) && newCostPerUnit !== item.costPerUnit) {
      updates.costPerUnit = newCostPerUnit;
    }
    
    if (!isNaN(newSuggestedOrder) && newSuggestedOrder !== item.suggestedOrder) {
      updates.suggestedOrder = newSuggestedOrder;
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      updateItem(item.id, updates);
    }

    // Handle stock adjustment if specified
    const adjustment = parseFloat(adjustmentQuantity);
    if (!isNaN(adjustment) && adjustment !== 0) {
      adjustStock(item.id, adjustment, adjustmentReason || "Manual adjustment");
    }

    onClose();
  };

  const handleQuickAdjustment = (amount: number) => {
    setAdjustmentQuantity(amount.toString());
  };

  const getStockStatus = (current: number, par: number): "low" | "medium" | "good" => {
    if (current <= par * 0.5) return "low";
    if (current <= par) return "medium";
    return "good";
  };

  if (!item) return null;

  const currentStockNum = parseFloat(currentStock) || (item.currentStock || 0);
  const parLevelNum = parseFloat(parLevel) || (item.parLevel || 0);
  const adjustmentNum = parseFloat(adjustmentQuantity) || 0;
  const projectedStock = currentStockNum + adjustmentNum;
  const stockStatus = getStockStatus(projectedStock, parLevelNum);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Pressable
                    onPress={onClose}
                    className="mr-3 p-2 rounded-lg bg-gray-100"
                  >
                    <Ionicons name="close" size={20} color="#374151" />
                  </Pressable>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                      Edit {item.name}
                    </Text>
                    <Text className="text-sm text-gray-600 capitalize">
                      {item.category} • {item.unit}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleSave}
                  className="bg-blue-600 rounded-lg py-2 px-4 active:bg-blue-700"
                >
                  <Text className="text-white font-medium">Save</Text>
                </Pressable>
              </View>
            </View>

            <View className="p-4 space-y-6">
              {/* Current Stock Status */}
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Current Status
                </Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-gray-600">Stock Level</Text>
                  <Text className={cn(
                    "text-lg font-bold",
                    stockStatus === "low" ? "text-red-600" : 
                    stockStatus === "medium" ? "text-amber-600" : "text-green-600"
                  )}>
                    {projectedStock} {item.unit}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-gray-600">Par Level</Text>
                  <Text className="text-sm text-gray-900">
                    {parLevelNum} {item.unit}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Stock Value</Text>
                  <Text className="text-sm text-gray-900">
                    ${(projectedStock * item.costPerUnit).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Stock Adjustment */}
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Adjust Stock
                </Text>
                
                {/* Quick Adjustment Buttons */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {[-10, -5, -1, 1, 5, 10].map((amount) => (
                    <Pressable
                      key={amount}
                      onPress={() => handleQuickAdjustment(amount)}
                      className={cn(
                        "px-3 py-2 rounded-lg border",
                        amount < 0 
                          ? "bg-red-50 border-red-200" 
                          : "bg-green-50 border-green-200"
                      )}
                    >
                      <Text className={cn(
                        "font-medium text-sm",
                        amount < 0 ? "text-red-700" : "text-green-700"
                      )}>
                        {amount > 0 ? "+" : ""}{amount}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View className="space-y-3">
                  <TextInput
                    value={adjustmentQuantity}
                    onChangeText={setAdjustmentQuantity}
                    placeholder="Adjustment quantity (+ to add, - to remove)"
                    keyboardType="numeric"
                    className="bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                  />
                  <TextInput
                    value={adjustmentReason}
                    onChangeText={setAdjustmentReason}
                    placeholder="Reason for adjustment (optional)"
                    className="bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                  />
                </View>

                {adjustmentNum !== 0 && (
                  <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Text className="text-blue-800 text-sm">
                      <Text className="font-medium">Projected Stock:</Text> {projectedStock} {item.unit}
                      {" "}({adjustmentNum > 0 ? "+" : ""}{adjustmentNum} {item.unit})
                    </Text>
                  </View>
                )}
              </View>

              {/* Par Level Settings */}
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Par Level Settings
                </Text>
                <View className="space-y-3">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Par Level ({item.unit})
                    </Text>
                    <TextInput
                      value={parLevel}
                      onChangeText={setParLevel}
                      placeholder="Minimum stock level"
                      keyboardType="numeric"
                      className="bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      You will be alerted when stock falls below this level
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Suggested Order Quantity ({item.unit})
                    </Text>
                    <TextInput
                      value={suggestedOrder}
                      onChangeText={setSuggestedOrder}
                      placeholder="Suggested order amount"
                      keyboardType="numeric"
                      className="bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                    />
                  </View>
                </View>
              </View>

              {/* Cost Settings */}
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Cost Information
                </Text>
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Cost per {item.unit} ($)
                  </Text>
                  <TextInput
                    value={costPerUnit}
                    onChangeText={setCostPerUnit}
                    placeholder="Cost per unit"
                    keyboardType="decimal-pad"
                    className="bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};