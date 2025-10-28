import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { AnimatedNumber } from "../AnimatedNumber";

// Simple test component for AnimatedNumber - only for development
export const AnimatedNumberTest: React.FC = () => {
  const [value, setValue] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPercentage = (val: number) => `${val.toFixed(1)}%`;

  return (
    <View style={{ padding: 20, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        AnimatedNumber Test
      </Text>
      
      {isVisible && (
        <>
          <View style={{ marginBottom: 20 }}>
            <Text>Basic Number:</Text>
            <AnimatedNumber value={value} />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text>Currency Format:</Text>
            <AnimatedNumber 
              value={value} 
              format={formatCurrency}
              style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text>Percentage Format:</Text>
            <AnimatedNumber 
              value={value / 4} 
              format={formatPercentage}
              style={{ fontSize: 16, color: 'blue' }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text>Delayed Animation:</Text>
            <AnimatedNumber 
              value={value} 
              delay={500}
              duration={2000}
              format={formatCurrency}
              style={{ fontSize: 20, fontWeight: 'bold', color: 'purple' }}
            />
          </View>
        </>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Pressable
          onPress={() => setValue(Math.floor(Math.random() * 10000) + 100)}
          style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>Random Value</Text>
        </Pressable>
        
        <Pressable
          onPress={() => setValue(0)}
          style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>Zero</Text>
        </Pressable>
        
        <Pressable
          onPress={() => setValue(1000000)}
          style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>1M</Text>
        </Pressable>

        <Pressable
          onPress={() => setIsVisible(!isVisible)}
          style={{ backgroundColor: 'orange', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>
            {isVisible ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>

      <Text style={{ marginTop: 20, fontSize: 12, color: 'gray' }}>
        Current Value: {value}
      </Text>
    </View>
  );
};