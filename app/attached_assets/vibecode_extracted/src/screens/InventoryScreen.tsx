import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePLStore } from "../state/plStore";
import { useInventoryStore, InventoryItem } from "../state/inventoryStore";
import { PLCard } from "../components/PLCard";
import { InventoryEditModal } from "../components/InventoryEditModal";
import { POSSyncStatus } from "../components/POSSyncStatus";
import { SmartParLevelOptimizer } from "../components/SmartParLevelOptimizer";

interface InventoryScreenProps {
  onBack: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onBack }) => {
  const { items, suppliers, getLowStockItems, getTotalInventoryValue, getSuggestedOrderValue, adjustStock } = useInventoryStore();
  const targets = usePLStore((state) => state.targets);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [quickCountMode, setQuickCountMode] = useState(false);
  const [countedItems, setCountedItems] = useState<Record<string, number>>({});

  const getSupplierName = (supplierId?: string): string => {
    if (!supplierId) return "No supplier";
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || "Unknown supplier";
  };

  const categories = ["all", "protein", "vegetables", "grains", "dairy", "other"];
  
  const filteredInventory = selectedCategory === "all" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case "protein": return "fish";
      case "vegetables": return "leaf";
      case "grains": return "nutrition";
      case "dairy": return "wine";
      default: return "cube";
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "protein": return "text-red-600";
      case "vegetables": return "text-green-600";
      case "grains": return "text-amber-600";
      case "dairy": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getStockStatus = (item: InventoryItem): "low" | "medium" | "good" => {
    const parLevel = item.parLevel || 0;
    const currentStock = item.currentStock || 0;
    if (currentStock <= parLevel * 0.5) return "low";
    if (currentStock <= parLevel) return "medium";
    return "good";
  };

  const lowStockItems = getLowStockItems();
  const totalInventoryValue = getTotalInventoryValue();
  const suggestedOrderValue = getSuggestedOrderValue();

  const inventoryAsPercentOfRevenue = targets.monthlyRevenue > 0 
    ? (totalInventoryValue / targets.monthlyRevenue) * 100 
    : 0;

  const handleGenerateOrder = () => {
    const itemsToOrder = items.filter(item => item.currentStock <= (item.parLevel || 0));
    if (itemsToOrder.length === 0) {
      Alert.alert("No Orders Needed", "All items are adequately stocked.");
      return;
    }
    
    Alert.alert(
      "Order Generated",
      `Generated order for ${itemsToOrder.length} items totaling $${suggestedOrderValue.toFixed(2)}`
    );
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  // Separate low and medium stock items for alerts
  const mediumStockItems = filteredInventory.filter(item => {
    const status = getStockStatus(item);
    return status === "medium";
  });

  const lowStockFilteredItems = filteredInventory.filter(item => {
    const status = getStockStatus(item);
    return status === "low";
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Pressable
                onPress={onBack}
                className="mr-3 p-2 rounded-lg bg-white border border-gray-200"
              >
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </Pressable>
              <View>
                <Text className="text-3xl font-bold text-gray-900">
                  Inventory
                </Text>
                <Text className="text-sm text-gray-600">
                  Manage your stock levels
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleGenerateOrder}
              className="bg-green-600 rounded-lg py-2 px-4 active:bg-green-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="basket" size={18} color="white" />
                <Text className="text-white font-medium ml-2">Order</Text>
              </View>
            </Pressable>
          </View>

          {/* Tutorial Banner */}
          <View className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <View className="flex-row items-start">
              <View className="mr-3 mt-1">
                <Ionicons name="information-circle" size={24} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-blue-900 mb-2">
                  📊 How Inventory Tracking Works
                </Text>
                <Text className="text-sm text-blue-800 mb-3">
                  Odin&apos;s Eye tracks your inventory three ways:
                </Text>
                
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <Text className="text-blue-600 font-bold mr-2">1.</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-blue-900">Manual Entry</Text>
                      <Text className="text-xs text-blue-700">Tap any item below to update stock levels during physical counts</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-start">
                    <Text className="text-blue-600 font-bold mr-2">2.</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-blue-900">POS Sync (Automatic)</Text>
                      <Text className="text-xs text-blue-700">Connect Square/Toast to auto-deduct ingredients when meals are sold</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-start">
                    <Text className="text-blue-600 font-bold mr-2">3.</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-blue-900">Variance Analysis</Text>
                      <Text className="text-xs text-blue-700">Compare expected vs actual inventory to detect waste and theft</Text>
                    </View>
                  </View>
                </View>
                
                <View className="mt-3 pt-3 border-t border-blue-200">
                  <Text className="text-xs text-blue-600 italic">
                    💡 Pro Tip: Use POS Sync + Weekly physical counts for best accuracy
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Category Filter */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2 px-1">
                {categories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedCategory === category
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text className={`font-medium capitalize ${
                      selectedCategory === category
                        ? "text-white"
                        : "text-gray-700"
                    }`}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* POS Sync Status */}
          <POSSyncStatus className="mb-6" />

          {/* Smart Par Level Optimizer */}
          <SmartParLevelOptimizer className="mb-6" />

          {/* Inventory Overview */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Overview
            </Text>
            <View className="grid grid-cols-2 gap-4 mb-4">
              <PLCard
                title="Total Inventory Value"
                value={totalInventoryValue}
                percentage={inventoryAsPercentOfRevenue}
                icon="cube"
                valueColor="blue"
              />
              <PLCard
                title="Suggested Order Value"
                value={suggestedOrderValue}
                icon="basket"
                valueColor={suggestedOrderValue > 0 ? "amber" : "green"}
              />
            </View>
          </View>

          {/* Alerts */}
          {(lowStockItems.length > 0) && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Stock Alerts
              </Text>
              {lowStockFilteredItems.length > 0 && (
                <View className="bg-red-50 rounded-xl p-4 border border-red-200 mb-3">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="warning" size={20} color="#DC2626" />
                    <Text className="text-red-900 font-semibold ml-2">
                      Critical Stock Levels ({lowStockFilteredItems.length} items)
                    </Text>
                  </View>
                  <Text className="text-red-800 text-sm">
                    {lowStockFilteredItems.map(item => item.name).join(", ")}
                  </Text>
                </View>
              )}
              {mediumStockItems.length > 0 && (
                <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="alert-circle" size={20} color="#D97706" />
                    <Text className="text-amber-900 font-semibold ml-2">
                      Low Stock ({mediumStockItems.length} items)
                    </Text>
                  </View>
                  <Text className="text-amber-800 text-sm">
                    {mediumStockItems.map(item => item.name).join(", ")}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Inventory Items */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Current Stock
              </Text>
              <Pressable
                onPress={handleGenerateOrder}
                className="bg-green-600 rounded-lg py-2 px-4 active:bg-green-700"
              >
                <Text className="text-white font-medium">Generate Order</Text>
              </Pressable>
            </View>
            
            <View className="space-y-3">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                const stockValue = item.currentStock * item.costPerUnit;
                
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleEditItem(item)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View className="mr-3">
                            <Ionicons 
                              name={getCategoryIcon(item.category)} 
                              size={24} 
                              color="#374151" 
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </Text>
                            <Text className={`text-sm font-medium capitalize ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className={`text-lg font-bold ${
                              status === "low" ? "text-red-600" : 
                              status === "medium" ? "text-amber-600" : "text-green-600"
                            }`}>
                              {item.currentStock} {item.unit}
                            </Text>
                            <Text className="text-sm text-gray-500">
                              ${stockValue.toFixed(2)} value
                            </Text>
                          </View>
                        </View>
                        
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-xs text-gray-500">
                              Supplier: {getSupplierName(item.supplierId)}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              Par level {item.parLevel || 0} {item.unit} • ${item.costPerUnit.toFixed(2)} per {item.unit}
                            </Text>
                            <Text className="text-xs text-gray-400">
                              Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            {item.currentStock <= (item.parLevel || 0) && (
                              <View className="bg-blue-50 rounded-lg px-3 py-1 mr-2">
                                <Text className="text-blue-800 text-xs font-medium">
                                  Order {item.suggestedOrder} {item.unit}
                                </Text>
                              </View>
                            )}
                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <InventoryEditModal
        visible={showEditModal}
        item={editingItem}
        onClose={handleCloseEditModal}
      />
    </SafeAreaView>
  );
};