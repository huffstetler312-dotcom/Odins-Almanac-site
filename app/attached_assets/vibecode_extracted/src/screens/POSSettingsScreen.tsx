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
import { useInventoryStore, POSConnection } from "../state/inventoryStore";
import { posIntegrationService, POSSystemConfig } from "../api/pos-integration";
import { cn } from "../utils/cn";

interface POSSettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

const POS_SYSTEMS = [
  { type: "square" as const, name: "Square", icon: "card", color: "bg-blue-600" },
  { type: "toast" as const, name: "Toast", icon: "restaurant", color: "bg-orange-600" },
  { type: "clover" as const, name: "Clover", icon: "leaf", color: "bg-green-600" },
  { type: "lightspeed" as const, name: "Lightspeed", icon: "flash", color: "bg-purple-600" },
  { type: "other" as const, name: "Other", icon: "apps", color: "bg-gray-600" },
];

export const POSSettingsScreen: React.FC<POSSettingsScreenProps> = ({
  visible,
  onClose,
}) => {
  const { posConnections } = useInventoryStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPOSType, setSelectedPOSType] = useState<"square" | "toast" | "clover" | "lightspeed" | "other">("square");
  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const getPOSSystemInfo = (type: string) => {
    return POS_SYSTEMS.find(system => system.type === type) || POS_SYSTEMS[4];
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? "checkmark-circle" : "alert-circle";
  };

  const handleAddConnection = async () => {
    if (!connectionName.trim() || !apiKey.trim() || !endpoint.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    setIsConnecting(true);
    try {
      const config: POSSystemConfig = {
        type: selectedPOSType,
        name: connectionName.trim(),
        apiKey: apiKey.trim(),
        endpoint: endpoint.trim(),
      };

      await posIntegrationService.addConnection(config);
      
      Alert.alert("Success", "POS system connected successfully!");
      setShowAddModal(false);
      resetAddForm();
    } catch (error) {
      Alert.alert("Connection Failed", "Could not connect to the POS system. Please check your credentials and try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const resetAddForm = () => {
    setConnectionName("");
    setApiKey("");
    setEndpoint("");
    setSelectedPOSType("square");
  };

  const handleRemoveConnection = (connection: POSConnection) => {
    Alert.alert(
      "Remove Connection",
      `Are you sure you want to remove the connection to ${connection.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            posIntegrationService.removeConnection(connection.id);
          },
        },
      ]
    );
  };

  const handleSyncConnection = async (connection: POSConnection) => {
    try {
      await posIntegrationService.syncConnection(connection.id);
      Alert.alert("Success", "Sync completed successfully!");
    } catch (error) {
      Alert.alert("Sync Failed", "Could not sync with the POS system. Please check the connection.");
    }
  };

  const getEndpointPlaceholder = (type: string) => {
    switch (type) {
      case "square":
        return "https://connect.squareup.com";
      case "toast":
        return "https://ws-api.toasttab.com";
      case "clover":
        return "https://api.clover.com";
      case "lightspeed":
        return "https://api.lightspeedhq.com";
      default:
        return "https://your-pos-api.com";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
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
                    POS Integration
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Connect your Point of Sale system
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setShowAddModal(true)}
                className="bg-blue-600 rounded-lg py-2 px-4 active:bg-blue-700"
              >
                <Text className="text-white font-medium">Add POS</Text>
              </Pressable>
            </View>
          </View>

          <View className="p-4">
            {/* Tutorial Section */}
            <View className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200 mb-6">
              <View className="flex-row items-start mb-3">
                <Ionicons name="bulb" size={24} color="#6366F1" />
                <Text className="text-lg font-bold text-indigo-900 ml-2">
                  🔌 How POS Integration Works
                </Text>
              </View>
              
              <View className="space-y-3">
                <View className="flex-row items-start">
                  <Text className="text-indigo-600 font-bold mr-2">1.</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-indigo-900">Connect Your POS System</Text>
                    <Text className="text-xs text-indigo-700">Get API credentials from your POS dashboard and enter them here</Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <Text className="text-indigo-600 font-bold mr-2">2.</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-indigo-900">Map Menu Items to Ingredients</Text>
                    <Text className="text-xs text-indigo-700">Go to Recipe Mapping to link your POS menu items with inventory ingredients</Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <Text className="text-indigo-600 font-bold mr-2">3.</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-indigo-900">Automatic Sync Every 5 Minutes</Text>
                    <Text className="text-xs text-indigo-700">When customers order, inventory automatically deducts. No manual counting!</Text>
                  </View>
                </View>
              </View>
              
              <View className="mt-4 pt-3 border-t border-indigo-200">
                <Text className="text-xs font-medium text-indigo-800 mb-2">📋 How to Get API Credentials:</Text>
                <Text className="text-xs text-indigo-700">
                  <Text className="font-semibold">Square:</Text> Dashboard → Developers → Create App → API Keys{"\n"}
                  <Text className="font-semibold">Toast:</Text> Admin → Integrations → API → Generate Token{"\n"}
                  <Text className="font-semibold">Clover:</Text> Developer Dashboard → Your App → API Tokens{"\n"}
                  <Text className="font-semibold">Lightspeed:</Text> Settings → API → Create API Key
                </Text>
              </View>
            </View>

            {/* Info Section */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#2563EB" />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-900 font-semibold mb-1">
                    Real-time Sync
                  </Text>
                  <Text className="text-blue-800 text-sm">
                    Connect your POS system to automatically sync inventory levels, sales data, and revenue. 
                    This keeps your restaurant management data up-to-date in real-time.
                  </Text>
                </View>
              </View>
            </View>

            {/* Connected Systems */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Connected Systems
              </Text>
              
              {posConnections.length === 0 ? (
                <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                  <Ionicons name="link" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 font-medium mt-3 mb-1">
                    No POS Systems Connected
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Add your first POS connection to start syncing data
                  </Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {posConnections.map((connection) => {
                    const systemInfo = getPOSSystemInfo(connection.type);
                    return (
                      <View key={connection.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center flex-1">
                            <View className={cn("w-10 h-10 rounded-lg items-center justify-center mr-3", systemInfo.color)}>
                              <Ionicons name={systemInfo.icon as any} size={20} color="white" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-lg font-semibold text-gray-900">
                                {connection.name}
                              </Text>
                              <Text className="text-sm text-gray-600 capitalize">
                                {systemInfo.name}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row items-center">
                            <Ionicons 
                              name={getStatusIcon(connection.isConnected) as any} 
                              size={20} 
                              color={connection.isConnected ? "#059669" : "#DC2626"} 
                            />
                            <Text className={cn("ml-1 text-sm font-medium", getStatusColor(connection.isConnected))}>
                              {connection.isConnected ? "Connected" : "Disconnected"}
                            </Text>
                          </View>
                        </View>
                        
                        {connection.lastSync && (
                          <Text className="text-xs text-gray-500 mb-3">
                            Last sync: {new Date(connection.lastSync).toLocaleString()}
                          </Text>
                        )}
                        
                        <View className="flex-row space-x-2">
                          <Pressable
                            onPress={() => handleSyncConnection(connection)}
                            className="flex-1 bg-blue-50 rounded-lg py-2 px-3 active:bg-blue-100"
                          >
                            <Text className="text-blue-700 font-medium text-center text-sm">
                              Sync Now
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleRemoveConnection(connection)}
                            className="bg-red-50 rounded-lg py-2 px-3 active:bg-red-100"
                          >
                            <Ionicons name="trash" size={16} color="#DC2626" />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Add Connection Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
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
                        onPress={() => setShowAddModal(false)}
                        className="mr-3 p-2 rounded-lg bg-gray-100"
                      >
                        <Ionicons name="close" size={20} color="#374151" />
                      </Pressable>
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-900">
                          Add POS Connection
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Connect your Point of Sale system
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={handleAddConnection}
                      disabled={isConnecting}
                      className={cn(
                        "rounded-lg py-2 px-4",
                        isConnecting ? "bg-gray-400" : "bg-blue-600 active:bg-blue-700"
                      )}
                    >
                      <Text className="text-white font-medium">
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View className="p-4 space-y-6">
                  {/* POS System Selection */}
                  <View>
                    <Text className="text-lg font-semibold text-gray-900 mb-4">
                      Select POS System
                    </Text>
                    <View className="grid grid-cols-2 gap-3">
                      {POS_SYSTEMS.map((system) => (
                        <Pressable
                          key={system.type}
                          onPress={() => setSelectedPOSType(system.type)}
                          className={cn(
                            "p-4 rounded-xl border-2",
                            selectedPOSType === system.type
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white"
                          )}
                        >
                          <View className="items-center">
                            <View className={cn("w-12 h-12 rounded-lg items-center justify-center mb-2", system.color)}>
                              <Ionicons name={system.icon as any} size={24} color="white" />
                            </View>
                            <Text className="font-medium text-gray-900">
                              {system.name}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Connection Details */}
                  <View className="space-y-4">
                    <Text className="text-lg font-semibold text-gray-900">
                      Connection Details
                    </Text>
                    
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        Connection Name
                      </Text>
                      <TextInput
                        value={connectionName}
                        onChangeText={setConnectionName}
                        placeholder="My Restaurant POS"
                        className="bg-white rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </Text>
                      <TextInput
                        value={apiKey}
                        onChangeText={setApiKey}
                        placeholder="Enter your API key"
                        secureTextEntry
                        className="bg-white rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        API Endpoint
                      </Text>
                      <TextInput
                        value={endpoint}
                        onChangeText={setEndpoint}
                        placeholder={getEndpointPlaceholder(selectedPOSType)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="bg-white rounded-lg px-3 py-3 text-gray-900 border border-gray-200"
                      />
                    </View>
                  </View>

                  {/* Help Text */}
                  <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <View className="flex-row items-start">
                      <Ionicons name="help-circle" size={20} color="#D97706" />
                      <View className="ml-3 flex-1">
                        <Text className="text-amber-900 font-medium mb-1">
                          Need Help?
                        </Text>
                        <Text className="text-amber-800 text-sm">
                          Contact your POS system provider to get API credentials. 
                          Make sure your POS system supports API access and that you have the necessary permissions.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};