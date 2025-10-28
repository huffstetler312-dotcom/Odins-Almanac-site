import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useInventoryStore } from "../state/inventoryStore";
import { posIntegrationService } from "../api/pos-integration";
import { cn } from "../utils/cn";

interface POSSyncStatusProps {
  className?: string;
}

export const POSSyncStatus: React.FC<POSSyncStatusProps> = ({ className }) => {
  const { posConnections } = useInventoryStore();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Start auto-sync for connected POS systems
    const connectedSystems = posConnections.filter(conn => conn.isConnected);
    
    if (connectedSystems.length > 0) {
      setIsConnected(true);
      
      // Start auto-sync for each connected system
      connectedSystems.forEach(connection => {
        posIntegrationService.startAutoSync(connection.id, 5); // Sync every 5 minutes
      });

      // Update last sync time
      const mostRecentSync = connectedSystems
        .filter(conn => conn.lastSync)
        .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0];
      
      if (mostRecentSync) {
        setLastSyncTime(mostRecentSync.lastSync!);
      }
    } else {
      setIsConnected(false);
      setLastSyncTime(null);
    }

    // Cleanup: stop auto-sync when component unmounts or connections change
    return () => {
      connectedSystems.forEach(connection => {
        posIntegrationService.stopAutoSync(connection.id);
      });
    };
  }, [posConnections]);

  const handleManualSync = async () => {
    const connectedSystems = posConnections.filter(conn => conn.isConnected);
    if (connectedSystems.length === 0) return;

    setIsSyncing(true);
    try {
      // Sync all connected systems
      await Promise.all(
        connectedSystems.map(conn => posIntegrationService.syncConnection(conn.id))
      );
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatSyncTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isConnected) {
    return null; // Don't show if no POS systems are connected
  }

  return (
    <View className={cn("bg-white rounded-xl p-3 border border-gray-100 shadow-sm", className)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={cn(
            "w-8 h-8 rounded-full items-center justify-center mr-3",
            isConnected ? "bg-green-100" : "bg-gray-100"
          )}>
            <Ionicons 
              name={isConnected ? "sync" : "sync-outline"} 
              size={16} 
              color={isConnected ? "#059669" : "#6B7280"} 
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-900">
              POS Sync {isConnected ? "Active" : "Inactive"}
            </Text>
            <Text className="text-xs text-gray-500">
              {lastSyncTime ? `Last sync: ${formatSyncTime(lastSyncTime)}` : "No sync yet"}
            </Text>
          </View>
        </View>
        
        <Pressable
          onPress={handleManualSync}
          disabled={isSyncing}
          className={cn(
            "px-3 py-1 rounded-lg",
            isSyncing ? "bg-gray-100" : "bg-blue-50 active:bg-blue-100"
          )}
        >
          <Text className={cn(
            "text-xs font-medium",
            isSyncing ? "text-gray-500" : "text-blue-700"
          )}>
            {isSyncing ? "Syncing..." : "Sync"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};