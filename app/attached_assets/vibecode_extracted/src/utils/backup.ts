import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export interface BackupData {
  version: string;
  exportDate: string;
  restaurantName: string;
  targets: any;
  actuals: any;
  currentMonth: string;
  currentYear: number;
  historicalData: any[];
}

export const createBackup = async (): Promise<BackupData | null> => {
  try {
    const storeData = await AsyncStorage.getItem('pl-store');
    if (!storeData) {
      throw new Error('No data found to backup');
    }

    const parsedData = JSON.parse(storeData);
    
    const backup: BackupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      restaurantName: parsedData.state?.restaurantName || '',
      targets: parsedData.state?.targets || {},
      actuals: parsedData.state?.actuals || {},
      currentMonth: parsedData.state?.currentMonth || '',
      currentYear: parsedData.state?.currentYear || new Date().getFullYear(),
      historicalData: parsedData.state?.historicalData || [],
    };

    return backup;
  } catch (error) {
    console.error('Backup creation failed:', error);
    return null;
  }
};

export const exportBackup = async (): Promise<boolean> => {
  try {
    const backup = await createBackup();
    if (!backup) {
      Alert.alert('Export Failed', 'No data available to export');
      return false;
    }

    const backupJson = JSON.stringify(backup, null, 2);
    const fileName = `PL_Backup_${backup.restaurantName || 'Restaurant'}_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, backupJson);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export P&L Backup',
      });
      return true;
    } else {
      Alert.alert('Export Complete', `Backup saved to: ${fileUri}`);
      return true;
    }
  } catch (error) {
    console.error('Export failed:', error);
    Alert.alert('Export Failed', 'Unable to export backup file');
    return false;
  }
};

export const validateBackup = (data: any): data is BackupData => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.version === 'string' &&
    typeof data.exportDate === 'string' &&
    data.targets &&
    data.actuals &&
    Array.isArray(data.historicalData)
  );
};

export const restoreFromBackup = async (backupData: BackupData): Promise<boolean> => {
  try {
    if (!validateBackup(backupData)) {
      Alert.alert('Invalid Backup', 'The backup file is corrupted or invalid');
      return false;
    }

    const currentStoreData = await AsyncStorage.getItem('pl-store');
    let storeStructure = { state: {}, version: 0 };
    
    if (currentStoreData) {
      storeStructure = JSON.parse(currentStoreData);
    }

    // Merge backup data into store structure
    storeStructure.state = {
      ...storeStructure.state,
      restaurantName: backupData.restaurantName,
      targets: backupData.targets,
      actuals: backupData.actuals,
      currentMonth: backupData.currentMonth,
      currentYear: backupData.currentYear,
      historicalData: backupData.historicalData,
      calculations: null, // Reset calculations to be recalculated
    };

    await AsyncStorage.setItem('pl-store', JSON.stringify(storeStructure));
    
    Alert.alert(
      'Restore Complete', 
      `Successfully restored data for ${backupData.restaurantName || 'your restaurant'} with ${backupData.historicalData.length} months of historical data.`
    );
    
    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    Alert.alert('Restore Failed', 'Unable to restore from backup file');
    return false;
  }
};

export const scheduleAutoBackup = async (frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> => {
  try {
    const lastBackup = await AsyncStorage.getItem('last-backup-date');
    const now = new Date();
    const today = now.toDateString();

    if (lastBackup === today) {
      return; // Already backed up today
    }

    let shouldBackup = false;

    if (frequency === 'daily') {
      shouldBackup = true;
    } else if (frequency === 'weekly') {
      const lastBackupDate = lastBackup ? new Date(lastBackup) : new Date(0);
      const daysDiff = Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
      shouldBackup = daysDiff >= 7;
    } else if (frequency === 'monthly') {
      const lastBackupDate = lastBackup ? new Date(lastBackup) : new Date(0);
      const monthsDiff = (now.getFullYear() - lastBackupDate.getFullYear()) * 12 + 
                        (now.getMonth() - lastBackupDate.getMonth());
      shouldBackup = monthsDiff >= 1;
    }

    if (shouldBackup) {
      const backup = await createBackup();
      if (backup) {
        await AsyncStorage.setItem('last-backup-date', today);
        await AsyncStorage.setItem('auto-backup-data', JSON.stringify(backup));
      }
    }
  } catch (error) {
    console.error('Auto backup failed:', error);
  }
};

export const getLastBackupInfo = async (): Promise<{ date: string; hasBackup: boolean } | null> => {
  try {
    const lastBackupDate = await AsyncStorage.getItem('last-backup-date');
    const hasBackup = await AsyncStorage.getItem('auto-backup-data');
    
    return {
      date: lastBackupDate || 'Never',
      hasBackup: !!hasBackup,
    };
  } catch (error) {
    return null;
  }
};