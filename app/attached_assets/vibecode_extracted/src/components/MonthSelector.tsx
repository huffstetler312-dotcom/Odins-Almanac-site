import React, { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePLStore } from "../state/plStore";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export const MonthSelector: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const currentMonth = usePLStore((state) => state.currentMonth);
  const currentYearState = usePLStore((state) => state.currentYear);
  const setCurrentMonth = usePLStore((state) => state.setCurrentMonth);
  const saveCurrentMonth = usePLStore((state) => state.saveCurrentMonth);

  const handleMonthSelect = (month: string, year: number) => {
    // Save current month data before switching
    const hasData = usePLStore.getState().actuals.actualRevenue > 0;
    if (hasData) {
      saveCurrentMonth();
    }
    
    setCurrentMonth(month, year);
    setIsVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(true)}
        className="flex-row items-center bg-white rounded-lg px-4 py-2 border border-gray-200"
      >
        <Text className="text-lg font-semibold text-gray-900 mr-2">
          {currentMonth} {currentYearState}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Select Month
              </Text>
              <Pressable
                onPress={() => setIsVisible(false)}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {years.map(year => (
              <View key={year} className="mb-4">
                <Text className="text-lg font-semibold text-gray-700 mb-2">
                  {year}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {months.map(month => (
                    <Pressable
                      key={`${month}-${year}`}
                      onPress={() => handleMonthSelect(month, year)}
                      className={`px-4 py-2 rounded-lg border ${
                        month === currentMonth && year === currentYearState
                          ? "bg-blue-600 border-blue-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Text className={`font-medium ${
                        month === currentMonth && year === currentYearState
                          ? "text-white"
                          : "text-gray-700"
                      }`}>
                        {month.slice(0, 3)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};