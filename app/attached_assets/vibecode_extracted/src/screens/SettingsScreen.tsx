import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { usePLStore } from "../state/plStore";
import { useInventoryStore } from "../state/inventoryStore";
import { exportBackup, restoreFromBackup, getLastBackupInfo, scheduleAutoBackup } from "../utils/backup";
import { POSSettingsScreen } from "./POSSettingsScreen";

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPOSSettings, setShowPOSSettings] = useState(false);
  const [tempName, setTempName] = useState("");
  const [backupInfo, setBackupInfo] = useState<{ date: string; hasBackup: boolean } | null>(null);
  const [autoBackupFreq, setAutoBackupFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  const restaurantName = usePLStore((state) => state.restaurantName);
  const setRestaurantName = usePLStore((state) => state.setRestaurantName);
  const historicalData = usePLStore((state) => state.historicalData);
  const deleteMonthlyData = usePLStore((state) => state.deleteMonthlyData);
  const resetData = usePLStore((state) => state.resetData);
  const { posConnections } = useInventoryStore();

  const handleSaveName = () => {
    if (tempName.trim()) {
      setRestaurantName(tempName.trim());
      setShowNameModal(false);
      setTempName("");
    }
  };

  const handleDeleteMonth = (id: string, monthName: string) => {
    Alert.alert(
      "Delete Month Data",
      `Are you sure you want to delete data for ${monthName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteMonthlyData(id)
        }
      ]
    );
  };

  const handleResetAllData = () => {
    Alert.alert(
      "Reset All Data",
      "This will delete all your P&L data, targets, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset Everything", 
          style: "destructive",
          onPress: () => {
            resetData();
            setRestaurantName("");
            Alert.alert("Success", "All data has been reset.");
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadBackupInfo();
    scheduleAutoBackup(autoBackupFreq);
  }, [autoBackupFreq]);

  const loadBackupInfo = async () => {
    const info = await getLastBackupInfo();
    setBackupInfo(info);
  };

  const handleExportBackup = async () => {
    const success = await exportBackup();
    if (success) {
      loadBackupInfo();
    }
  };

  const handleImportBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        const response = await fetch(fileUri);
        const backupData = await response.json();
        
        Alert.alert(
          'Restore Backup',
          'This will replace all current data. Are you sure?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Restore',
              style: 'destructive',
              onPress: async () => {
                const success = await restoreFromBackup(backupData);
                if (success) {
                  // Force app refresh by reloading
                  Alert.alert('Restart Required', 'Please restart the app to complete the restore process.');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Import Failed', 'Unable to read backup file');
    }
  };

  const openNameModal = () => {
    setTempName(restaurantName);
    setShowNameModal(true);
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
                Settings
              </Text>
              <Text className="text-lg text-gray-600">
                Manage your data and preferences
              </Text>
            </View>
          </View>

          {/* Restaurant Name */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Restaurant Information
            </Text>
            <Pressable
              onPress={openNameModal}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    Restaurant Name
                  </Text>
                  <Text className="text-lg text-gray-900">
                    {restaurantName || "Not set"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>
          </View>

          {/* POS Integration */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Integrations
            </Text>
            <Pressable
              onPress={() => setShowPOSSettings(true)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 mb-1">
                    POS Integration
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {posConnections.length > 0 
                      ? `${posConnections.length} connection${posConnections.length > 1 ? 's' : ''} configured`
                      : "Connect your Point of Sale system"
                    }
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {posConnections.some(conn => conn.isConnected) && (
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </View>
            </Pressable>
          </View>

          {/* Backup & Restore */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Backup & Restore
            </Text>
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Pressable
                onPress={handleExportBackup}
                className="p-4 border-b border-gray-100 active:bg-gray-50"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      Export Backup
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Save all your data to a file
                    </Text>
                  </View>
                  <Ionicons name="cloud-upload" size={20} color="#9CA3AF" />
                </View>
              </Pressable>

              <Pressable
                onPress={handleImportBackup}
                className="p-4 border-b border-gray-100 active:bg-gray-50"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      Import Backup
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Restore data from a backup file
                    </Text>
                  </View>
                  <Ionicons name="cloud-download" size={20} color="#9CA3AF" />
                </View>
              </Pressable>

              <View className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-medium text-gray-900">
                    Auto Backup
                  </Text>
                  <View className="flex-row bg-gray-100 rounded-lg p-1">
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                      <Pressable
                        key={freq}
                        onPress={() => setAutoBackupFreq(freq)}
                        className={`px-3 py-1 rounded-md ${
                          autoBackupFreq === freq ? 'bg-blue-600' : 'bg-transparent'
                        }`}
                      >
                        <Text className={`text-xs font-medium capitalize ${
                          autoBackupFreq === freq ? 'text-white' : 'text-gray-600'
                        }`}>
                          {freq}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Text className="text-sm text-gray-600">
                  Last backup: {backupInfo?.date || 'Never'}
                </Text>
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Data Management
            </Text>
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-medium text-gray-900">
                      Historical Data
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {historicalData.length} months stored
                    </Text>
                  </View>
                  <Ionicons name="archive" size={20} color="#9CA3AF" />
                </View>
              </View>

              {historicalData.length > 0 && (
                <View className="max-h-64">
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {historicalData.map((data) => (
                      <View key={data.id} className="p-4 border-b border-gray-50 flex-row items-center justify-between">
                        <View>
                          <Text className="font-medium text-gray-900">
                            {data.month} {data.year}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            Revenue: ${data.actuals.actualRevenue.toLocaleString()}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => handleDeleteMonth(data.id, `${data.month} ${data.year}`)}
                          className="p-2"
                        >
                          <Ionicons name="trash" size={18} color="#EF4444" />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Danger Zone */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-red-600 mb-4">
              Danger Zone
            </Text>
            <Pressable
              onPress={handleResetAllData}
              className="bg-red-50 rounded-xl p-4 border border-red-200"
            >
              <View className="flex-row items-center">
                <Ionicons name="warning" size={24} color="#DC2626" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium text-red-900">
                    Reset All Data
                  </Text>
                  <Text className="text-sm text-red-700">
                    Delete all P&L data, settings, and start fresh
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#DC2626" />
              </View>
            </Pressable>
          </View>

          {/* App Info */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              About
            </Text>
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Restaurant P&L Manager
              </Text>
              <Text className="text-sm text-gray-600 mb-2">
                Version 1.0.0
              </Text>
              <Text className="text-sm text-gray-600">
                Manage your restaurant&apos;s profit and loss with ease. Track targets, monitor performance, and optimize your business operations.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Restaurant Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Restaurant Name
            </Text>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter restaurant name"
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-lg mb-6"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => setShowNameModal(false)}
                className="flex-1 bg-gray-200 rounded-lg py-3"
              >
                <Text className="text-center font-semibold text-gray-700">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                className="flex-1 bg-blue-600 rounded-lg py-3"
              >
                <Text className="text-center font-semibold text-white">
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* POS Settings Modal */}
      <POSSettingsScreen
        visible={showPOSSettings}
        onClose={() => setShowPOSSettings(false)}
      />
    </SafeAreaView>
  );
};