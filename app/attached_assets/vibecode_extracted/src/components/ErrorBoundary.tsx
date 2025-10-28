import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-gray-50">
          <View className="bg-white rounded-2xl p-8 items-center max-w-md">
            <Ionicons name="warning" size={64} color="#EF4444" />
            <Text className="text-2xl font-bold text-gray-900 mt-4 mb-2 text-center">
              Something went wrong
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              We encountered an unexpected error. Please try again.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View className="bg-red-50 rounded-lg p-4 mb-6 w-full">
                <Text className="text-red-800 text-xs font-mono">
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <Pressable
              onPress={this.handleRetry}
              className="bg-blue-600 rounded-lg py-3 px-6 active:bg-blue-700"
            >
              <Text className="text-white font-semibold">
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}