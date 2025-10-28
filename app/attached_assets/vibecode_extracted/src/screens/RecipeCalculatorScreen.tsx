import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCard } from "../components/AnimatedCard";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
}

interface Recipe {
  id: string;
  name: string;
  servings: number;
  ingredients: Ingredient[];
  totalCost: number;
  costPerServing: number;
  suggestedPrice: number;
  profitMargin: number;
}

interface RecipeCalculatorScreenProps {
  onBack: () => void;
}

export const RecipeCalculatorScreen: React.FC<RecipeCalculatorScreenProps> = ({ onBack }) => {
  const [recipeName, setRecipeName] = useState("");
  const [servings, setServings] = useState("4");
  const [targetMargin, setTargetMargin] = useState("65");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showAddIngredient, setShowAddIngredient] = useState(false);

  // New ingredient form state
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    unit: "lbs",
    costPerUnit: "",
  });

  const units = ["lbs", "oz", "cups", "tsp", "tbsp", "each", "grams", "liters"];

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity || !newIngredient.costPerUnit) {
      Alert.alert("Missing Information", "Please fill in all ingredient details");
      return;
    }

    const quantity = parseFloat(newIngredient.quantity);
    const costPerUnit = parseFloat(newIngredient.costPerUnit);
    const totalCost = quantity * costPerUnit;

    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      quantity,
      unit: newIngredient.unit,
      costPerUnit,
      totalCost,
    };

    setIngredients([...ingredients, ingredient]);
    setNewIngredient({ name: "", quantity: "", unit: "lbs", costPerUnit: "" });
    setShowAddIngredient(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const calculateRecipe = (): Recipe | null => {
    if (!recipeName || ingredients.length === 0) return null;

    const totalCost = ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
    const servingsNum = parseInt(servings) || 1;
    const costPerServing = totalCost / servingsNum;
    const marginPercent = parseFloat(targetMargin) || 65;
    
    // Suggested price = cost / (1 - margin%)
    const suggestedPrice = costPerServing / (1 - marginPercent / 100);

    return {
      id: Date.now().toString(),
      name: recipeName,
      servings: servingsNum,
      ingredients,
      totalCost,
      costPerServing,
      suggestedPrice,
      profitMargin: marginPercent,
    };
  };

  const recipe = calculateRecipe();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Pressable
              onPress={onBack}
              className="mr-3 p-2 rounded-lg bg-white border border-gray-200"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </Pressable>
            <View>
              <Text className="text-3xl font-bold text-gray-900">
                Recipe Calculator
              </Text>
              <Text className="text-lg text-gray-600">
                Calculate recipe costs and pricing
              </Text>
            </View>
          </View>

          {/* Recipe Info */}
          <AnimatedCard className="p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Recipe Information
            </Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-2">
                  Recipe Name
                </Text>
                <TextInput
                  value={recipeName}
                  onChangeText={setRecipeName}
                  placeholder="Enter recipe name"
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base"
                />
              </View>
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Servings
                  </Text>
                  <TextInput
                    value={servings}
                    onChangeText={setServings}
                    placeholder="4"
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Target Margin %
                  </Text>
                  <TextInput
                    value={targetMargin}
                    onChangeText={setTargetMargin}
                    placeholder="65"
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base"
                  />
                </View>
              </View>
            </View>
          </AnimatedCard>

          {/* Ingredients */}
          <AnimatedCard className="p-4 mb-6" delay={100}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Ingredients
              </Text>
              <Pressable
                onPress={() => setShowAddIngredient(true)}
                className="bg-blue-600 rounded-lg py-2 px-4"
              >
                <Text className="text-white font-medium">Add Ingredient</Text>
              </Pressable>
            </View>

            {ingredients.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="restaurant" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2">No ingredients added yet</Text>
              </View>
            ) : (
              <View className="space-y-3">
                {ingredients.map((ingredient) => (
                  <View key={ingredient.id} className="bg-gray-50 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">
                          {ingredient.name}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {ingredient.quantity} {ingredient.unit} × {formatCurrency(ingredient.costPerUnit)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-gray-900">
                          {formatCurrency(ingredient.totalCost)}
                        </Text>
                        <Pressable
                          onPress={() => removeIngredient(ingredient.id)}
                          className="mt-1 p-1"
                        >
                          <Ionicons name="trash" size={16} color="#EF4444" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Add Ingredient Form */}
            {showAddIngredient && (
              <View className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Text className="font-semibold text-blue-900 mb-3">
                  Add New Ingredient
                </Text>
                <View className="space-y-3">
                  <TextInput
                    value={newIngredient.name}
                    onChangeText={(text) => setNewIngredient({...newIngredient, name: text})}
                    placeholder="Ingredient name"
                    className="bg-white border border-blue-200 rounded-lg px-3 py-2"
                  />
                  <View className="flex-row space-x-2">
                    <TextInput
                      value={newIngredient.quantity}
                      onChangeText={(text) => setNewIngredient({...newIngredient, quantity: text})}
                      placeholder="Quantity"
                      keyboardType="numeric"
                      className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2"
                    />
                    <View className="flex-1 bg-white border border-blue-200 rounded-lg">
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row">
                          {units.map((unit) => (
                            <Pressable
                              key={unit}
                              onPress={() => setNewIngredient({...newIngredient, unit})}
                              className={`px-3 py-2 ${
                                newIngredient.unit === unit ? 'bg-blue-600' : 'bg-transparent'
                              }`}
                            >
                              <Text className={`text-sm ${
                                newIngredient.unit === unit ? 'text-white' : 'text-gray-700'
                              }`}>
                                {unit}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                    <TextInput
                      value={newIngredient.costPerUnit}
                      onChangeText={(text) => setNewIngredient({...newIngredient, costPerUnit: text})}
                      placeholder="Cost per unit"
                      keyboardType="numeric"
                      className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2"
                    />
                  </View>
                  <View className="flex-row space-x-2">
                    <Pressable
                      onPress={() => setShowAddIngredient(false)}
                      className="flex-1 bg-gray-200 rounded-lg py-2"
                    >
                      <Text className="text-center font-medium text-gray-700">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={addIngredient}
                      className="flex-1 bg-blue-600 rounded-lg py-2"
                    >
                      <Text className="text-center font-medium text-white">Add</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Recipe Results */}
          {recipe && (
            <AnimatedCard className="p-4 mb-6" delay={200}>
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Recipe Costing
              </Text>
              <View className="space-y-4">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Total Recipe Cost</Text>
                  <Text className="font-bold text-gray-900 text-lg">
                    {formatCurrency(recipe.totalCost)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Cost per Serving</Text>
                  <Text className="font-bold text-gray-900 text-lg">
                    {formatCurrency(recipe.costPerServing)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Suggested Price</Text>
                  <Text className="font-bold text-green-600 text-xl">
                    {formatCurrency(recipe.suggestedPrice)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-gray-600">Profit Margin</Text>
                  <Text className="font-bold text-green-600 text-lg">
                    {recipe.profitMargin.toFixed(1)}%
                  </Text>
                </View>
              </View>
              
              {/* Save Recipe */}
              <Pressable
                onPress={() => Alert.alert('Saved!', 'Recipe cost calculation saved')}
                className="bg-green-600 rounded-lg py-3 mt-4"
              >
                <Text className="text-center font-semibold text-white">
                  Save Recipe
                </Text>
              </Pressable>
            </AnimatedCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};