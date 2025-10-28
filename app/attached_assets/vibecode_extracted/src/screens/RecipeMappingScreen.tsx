import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRecipeStore, MenuItem, RecipeIngredient } from "../state/recipeStore";
import { useInventoryStore } from "../state/inventoryStore";
import { cn } from "../utils/cn";
import { lightHaptic } from "../utils/haptics";

interface RecipeMappingScreenProps {
  onBack: () => void;
}

export const RecipeMappingScreen: React.FC<RecipeMappingScreenProps> = ({ onBack }) => {
  const { menuItems, addMenuItem, deleteMenuItem, calculateRecipeCost, addIngredientToMenuItem, removeIngredientFromMenuItem } = useRecipeStore();
  const { items: inventoryItems } = useInventoryStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  
  // New menu item form
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<MenuItem["category"]>("entrees");
  const [newItemPrepTime, setNewItemPrepTime] = useState("");

  const categories = ["all", "entrees", "appetizers", "sides", "desserts", "beverages"];

  const filteredMenuItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "entrees": return "restaurant";
      case "appetizers": return "fast-food";
      case "sides": return "nutrition";
      case "desserts": return "ice-cream";
      case "beverages": return "wine";
      default: return "list";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "entrees": return "text-blue-600";
      case "appetizers": return "text-orange-600";
      case "sides": return "text-green-600";
      case "desserts": return "text-pink-600";
      case "beverages": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const handleAddMenuItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) {
      Alert.alert("Missing Information", "Please provide menu item name and price.");
      return;
    }

    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price.");
      return;
    }

    addMenuItem({
      name: newItemName.trim(),
      price,
      category: newItemCategory,
      prepTime: newItemPrepTime ? parseInt(newItemPrepTime) : undefined,
      ingredients: [],
      isActive: true,
    });

    setShowAddModal(false);
    resetAddForm();
    Alert.alert("Success", "Menu item added! Now add ingredients to complete the recipe.");
  };

  const resetAddForm = () => {
    setNewItemName("");
    setNewItemPrice("");
    setNewItemCategory("entrees");
    setNewItemPrepTime("");
  };

  const handleDeleteMenuItem = (item: MenuItem) => {
    Alert.alert(
      "Delete Menu Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMenuItem(item.id),
        },
      ]
    );
  };

  const handleAddIngredient = (menuItemId: string) => {
    setEditingMenuItem(menuItems.find((item) => item.id === menuItemId) || null);
    setShowIngredientPicker(true);
  };

  const handleSelectIngredient = (inventoryItemId: string) => {
    if (!editingMenuItem) return;

    const inventoryItem = inventoryItems.find((item) => item.id === inventoryItemId);
    if (!inventoryItem) return;

    const ingredient: RecipeIngredient = {
      inventoryItemId: inventoryItem.id,
      inventoryItemName: inventoryItem.name,
      quantity: 1,
      unit: inventoryItem.unit,
    };

    addIngredientToMenuItem(editingMenuItem.id, ingredient);
    setShowIngredientPicker(false);
  };

  const renderRecipeCostCard = (menuItem: MenuItem) => {
    const costBreakdown = calculateRecipeCost(menuItem.id);
    if (!costBreakdown) return null;

    return (
      <View className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <Text className="text-xs font-semibold text-gray-700 mb-2">Cost Analysis</Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-600">Ingredient Cost:</Text>
          <Text className="text-xs font-medium text-gray-900">${costBreakdown.totalIngredientCost.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-600">Menu Price:</Text>
          <Text className="text-xs font-medium text-gray-900">${costBreakdown.menuPrice.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-600">Food Cost %:</Text>
          <Text className={`text-xs font-bold ${
            costBreakdown.foodCostPercentage <= 30 ? "text-green-600" :
            costBreakdown.foodCostPercentage <= 35 ? "text-amber-600" : "text-red-600"
          }`}>
            {costBreakdown.foodCostPercentage.toFixed(1)}%
          </Text>
        </View>
        <View className="flex-row justify-between pt-2 border-t border-gray-300">
          <Text className="text-xs font-semibold text-gray-700">Profit Margin:</Text>
          <Text className={`text-xs font-bold ${
            costBreakdown.profitMargin >= 60 ? "text-green-600" :
            costBreakdown.profitMargin >= 50 ? "text-amber-600" : "text-red-600"
          }`}>
            {costBreakdown.profitMargin.toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <Pressable
                onPress={onBack}
                className="mr-3 p-2 rounded-lg bg-white border border-gray-200"
              >
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </Pressable>
              <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900">Recipe Mapping</Text>
                <Text className="text-sm text-gray-600">Map menu items to ingredients</Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                lightHaptic();
                setShowAddModal(true);
              }}
              className="bg-blue-600 rounded-lg p-3 active:bg-blue-700"
            >
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          </View>

          {/* Info Banner */}
          <View className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <View className="flex-row items-start">
              <Ionicons name="restaurant" size={20} color="#6366F1" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-indigo-900 mb-1">
                  🍔 Why Recipe Mapping Matters
                </Text>
                <Text className="text-xs text-indigo-800">
                  When you connect a POS system, Odin&apos;s Eye automatically deducts ingredients when menu items are sold. This ensures real-time inventory accuracy without manual counting.
                </Text>
              </View>
            </View>
          </View>

          {/* Category Filter */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {categories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => {
                      lightHaptic();
                      setSelectedCategory(category);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full border",
                      selectedCategory === category
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <Text
                      className={cn(
                        "font-medium capitalize",
                        selectedCategory === category ? "text-white" : "text-gray-700"
                      )}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Menu Items List */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Menu Items ({filteredMenuItems.length})
            </Text>

            {filteredMenuItems.length === 0 ? (
              <View className="bg-white rounded-xl p-8 items-center">
                <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-3 text-center">
                  No menu items yet. Add your first item!
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {filteredMenuItems.map((item) => (
                  <View
                    key={item.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  >
                    {/* Header */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Ionicons
                            name={getCategoryIcon(item.category)}
                            size={20}
                            color="#374151"
                          />
                          <Text className="text-lg font-bold text-gray-900 ml-2">
                            {item.name}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className={cn("text-sm font-medium capitalize", getCategoryColor(item.category))}>
                            {item.category}
                          </Text>
                          <Text className="text-sm text-gray-400 mx-2">•</Text>
                          <Text className="text-sm font-bold text-green-600">
                            ${item.price.toFixed(2)}
                          </Text>
                          {item.prepTime && (
                            <>
                              <Text className="text-sm text-gray-400 mx-2">•</Text>
                              <Text className="text-sm text-gray-600">{item.prepTime} min</Text>
                            </>
                          )}
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteMenuItem(item)}
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#DC2626" />
                      </Pressable>
                    </View>

                    {/* Ingredients */}
                    <View className="mb-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-gray-700">
                          Ingredients ({item.ingredients.length})
                        </Text>
                        <Pressable
                          onPress={() => handleAddIngredient(item.id)}
                          className="flex-row items-center"
                        >
                          <Ionicons name="add-circle" size={18} color="#2563EB" />
                          <Text className="text-xs font-medium text-blue-600 ml-1">Add</Text>
                        </Pressable>
                      </View>

                      {item.ingredients.length === 0 ? (
                        <View className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <Text className="text-xs text-amber-800">
                            ⚠️ No ingredients mapped. Add ingredients to enable auto-tracking.
                          </Text>
                        </View>
                      ) : (
                        <View className="space-y-2">
                          {item.ingredients.map((ingredient) => (
                            <View
                              key={ingredient.inventoryItemId}
                              className="flex-row items-center justify-between bg-gray-50 rounded-lg p-2"
                            >
                              <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-900">
                                  {ingredient.inventoryItemName}
                                </Text>
                                <Text className="text-xs text-gray-500">
                                  {ingredient.quantity} {ingredient.unit}
                                </Text>
                              </View>
                              <Pressable
                                onPress={() =>
                                  removeIngredientFromMenuItem(item.id, ingredient.inventoryItemId)
                                }
                                className="p-2"
                              >
                                <Ionicons name="close-circle" size={20} color="#DC2626" />
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Cost Analysis */}
                    {item.ingredients.length > 0 && renderRecipeCostCard(item)}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Menu Item Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="bg-white rounded-t-3xl p-6 shadow-2xl" style={{ minHeight: "50%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-900">Add Menu Item</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Item Name *</Text>
                  <TextInput
                    value={newItemName}
                    onChangeText={setNewItemName}
                    placeholder="e.g., Classic Burger"
                    className="bg-gray-50 rounded-lg px-4 py-3 text-base"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-2">
                      {["entrees", "appetizers", "sides", "desserts", "beverages"].map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => setNewItemCategory(cat as MenuItem["category"])}
                          className={cn(
                            "px-4 py-2 rounded-full border",
                            newItemCategory === cat
                              ? "bg-blue-600 border-blue-600"
                              : "bg-gray-100 border-gray-200"
                          )}
                        >
                          <Text
                            className={cn(
                              "font-medium capitalize",
                              newItemCategory === cat ? "text-white" : "text-gray-700"
                            )}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Price *</Text>
                  <TextInput
                    value={newItemPrice}
                    onChangeText={setNewItemPrice}
                    placeholder="12.99"
                    keyboardType="decimal-pad"
                    className="bg-gray-50 rounded-lg px-4 py-3 text-base"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Prep Time (minutes)
                  </Text>
                  <TextInput
                    value={newItemPrepTime}
                    onChangeText={setNewItemPrepTime}
                    placeholder="10"
                    keyboardType="number-pad"
                    className="bg-gray-50 rounded-lg px-4 py-3 text-base"
                  />
                </View>

                <Pressable
                  onPress={handleAddMenuItem}
                  className="bg-blue-600 rounded-lg py-4 mt-4 active:bg-blue-700"
                >
                  <Text className="text-white font-semibold text-center text-lg">
                    Add Menu Item
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Ingredient Picker Modal */}
      <Modal visible={showIngredientPicker} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: "70%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Ingredient</Text>
              <Pressable onPress={() => setShowIngredientPicker(false)}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-2">
                {inventoryItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectIngredient(item.id)}
                    className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4 active:bg-gray-100"
                  >
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
                      <Text className="text-sm text-gray-500 capitalize">{item.category}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-medium text-gray-700">
                        ${item.costPerUnit.toFixed(2)} / {item.unit}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {item.currentStock} {item.unit} in stock
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
