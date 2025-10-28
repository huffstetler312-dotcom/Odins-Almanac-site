import { AccessibilityInfo } from 'react-native';

export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

export const getAccessibilityProps = (label: string, hint?: string, role?: string) => {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role as any,
  };
};

export const getCurrencyAccessibilityLabel = (amount: number): string => {
  return `${amount} dollars`;
};

export const getPercentageAccessibilityLabel = (percentage: number): string => {
  return `${percentage.toFixed(1)} percent`;
};