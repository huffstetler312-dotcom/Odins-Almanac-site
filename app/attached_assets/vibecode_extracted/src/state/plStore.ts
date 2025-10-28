import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PLTarget {
  monthlyRevenue: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  overheadPercentage: number;
  targetProfitMargin: number;
}

export interface PLActual {
  actualRevenue: number;
  actualFoodCost: number;
  actualLaborCost: number;
  actualOverhead: number;
}

export interface MonthlyPLData {
  id: string;
  month: string;
  year: number;
  targets: PLTarget;
  actuals: PLActual;
  calculations: PLCalculations;
  createdAt: string;
  updatedAt: string;
}

export interface PLCalculations {
  targetFoodCost: number;
  targetLaborCost: number;
  targetOverhead: number;
  targetProfit: number;
  actualFoodCostPercentage: number;
  actualLaborCostPercentage: number;
  actualOverheadPercentage: number;
  actualProfit: number;
  actualProfitMargin: number;
  varianceFoodCost: number;
  varianceLaborCost: number;
  varianceOverhead: number;
  varianceProfit: number;
}

interface PLStore {
  targets: PLTarget;
  actuals: PLActual;
  calculations: PLCalculations | null;
  currentMonth: string;
  currentYear: number;
  historicalData: MonthlyPLData[];
  restaurantName: string;
  
  setTargets: (targets: PLTarget) => void;
  setActuals: (actuals: PLActual) => void;
  calculatePL: () => void;
  setCurrentMonth: (month: string, year?: number) => void;
  setRestaurantName: (name: string) => void;
  saveCurrentMonth: () => void;
  getHistoricalData: (months: number) => MonthlyPLData[];
  deleteMonthlyData: (id: string) => void;
  resetData: () => void;
  exportData: (format: "csv" | "json") => string;
}

const defaultTargets: PLTarget = {
  monthlyRevenue: 0,
  foodCostPercentage: 30,
  laborCostPercentage: 25,
  overheadPercentage: 20,
  targetProfitMargin: 25,
};

const defaultActuals: PLActual = {
  actualRevenue: 0,
  actualFoodCost: 0,
  actualLaborCost: 0,
  actualOverhead: 0,
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const usePLStore = create<PLStore>()(
  persist(
    (set, get) => ({
      targets: defaultTargets,
      actuals: defaultActuals,
      calculations: null,
      currentMonth: new Date().toLocaleDateString("en-US", { month: "long" }),
      currentYear: new Date().getFullYear(),
      historicalData: [],
      restaurantName: "",

      setTargets: (targets) => {
        set({ targets });
        get().calculatePL();
      },

      setActuals: (actuals) => {
        set({ actuals });
        get().calculatePL();
      },

      calculatePL: () => {
        const { targets, actuals } = get();
        
        const targetFoodCost = (targets.monthlyRevenue * targets.foodCostPercentage) / 100;
        const targetLaborCost = (targets.monthlyRevenue * targets.laborCostPercentage) / 100;
        const targetOverhead = (targets.monthlyRevenue * targets.overheadPercentage) / 100;
        const targetProfit = (targets.monthlyRevenue * targets.targetProfitMargin) / 100;

        const actualFoodCostPercentage = actuals.actualRevenue > 0 
          ? (actuals.actualFoodCost / actuals.actualRevenue) * 100 
          : 0;
        const actualLaborCostPercentage = actuals.actualRevenue > 0 
          ? (actuals.actualLaborCost / actuals.actualRevenue) * 100 
          : 0;
        const actualOverheadPercentage = actuals.actualRevenue > 0 
          ? (actuals.actualOverhead / actuals.actualRevenue) * 100 
          : 0;

        const actualProfit = actuals.actualRevenue - actuals.actualFoodCost - actuals.actualLaborCost - actuals.actualOverhead;
        const actualProfitMargin = actuals.actualRevenue > 0 
          ? (actualProfit / actuals.actualRevenue) * 100 
          : 0;

        const varianceFoodCost = targetFoodCost - actuals.actualFoodCost;
        const varianceLaborCost = targetLaborCost - actuals.actualLaborCost;
        const varianceOverhead = targetOverhead - actuals.actualOverhead;
        const varianceProfit = actualProfit - targetProfit;

        const calculations: PLCalculations = {
          targetFoodCost,
          targetLaborCost,
          targetOverhead,
          targetProfit,
          actualFoodCostPercentage,
          actualLaborCostPercentage,
          actualOverheadPercentage,
          actualProfit,
          actualProfitMargin,
          varianceFoodCost,
          varianceLaborCost,
          varianceOverhead,
          varianceProfit,
        };

        set({ calculations });
      },

      setCurrentMonth: (month, year) => {
        const currentYear = year || get().currentYear;
        set({ 
          currentMonth: month, 
          currentYear,
          // Reset current data when switching months
          targets: defaultTargets,
          actuals: defaultActuals,
          calculations: null,
        });
      },

      setRestaurantName: (name) => set({ restaurantName: name }),

      saveCurrentMonth: () => {
        const { targets, actuals, calculations, currentMonth, currentYear, historicalData } = get();
        
        if (!calculations) return;

        const monthData: MonthlyPLData = {
          id: generateId(),
          month: currentMonth,
          year: currentYear,
          targets,
          actuals,
          calculations,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Remove existing data for the same month/year
        const filteredData = historicalData.filter(
          data => !(data.month === currentMonth && data.year === currentYear)
        );

        set({ 
          historicalData: [...filteredData, monthData].sort((a, b) => 
            new Date(b.year, getMonthIndex(b.month)).getTime() - new Date(a.year, getMonthIndex(a.month)).getTime()
          )
        });
      },

      getHistoricalData: (months) => {
        const { historicalData } = get();
        return historicalData.slice(0, months);
      },

      deleteMonthlyData: (id) => {
        const { historicalData } = get();
        set({ 
          historicalData: historicalData.filter(data => data.id !== id) 
        });
      },

      resetData: () => set({
        targets: defaultTargets,
        actuals: defaultActuals,
        calculations: null,
      }),

      exportData: (format) => {
        const { historicalData, restaurantName } = get();
        
        if (format === "json") {
          return JSON.stringify({
            restaurantName,
            exportDate: new Date().toISOString(),
            data: historicalData,
          }, null, 2);
        }
        
        // CSV format
        let csv = "Restaurant Name,Month,Year,Target Revenue,Actual Revenue,Target Food Cost %,Actual Food Cost %,Target Labor Cost %,Actual Labor Cost %,Target Overhead %,Actual Overhead %,Target Profit Margin %,Actual Profit Margin %,Actual Profit\n";
        
        historicalData.forEach(data => {
          csv += `"${restaurantName}",${data.month},${data.year},${data.targets.monthlyRevenue},${data.actuals.actualRevenue},${data.targets.foodCostPercentage},${data.calculations.actualFoodCostPercentage.toFixed(2)},${data.targets.laborCostPercentage},${data.calculations.actualLaborCostPercentage.toFixed(2)},${data.targets.overheadPercentage},${data.calculations.actualOverheadPercentage.toFixed(2)},${data.targets.targetProfitMargin},${data.calculations.actualProfitMargin.toFixed(2)},${data.calculations.actualProfit.toFixed(2)}\n`;
        });
        
        return csv;
      },
    }),
    {
      name: "pl-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        targets: state.targets,
        actuals: state.actuals,
        currentMonth: state.currentMonth,
        currentYear: state.currentYear,
        historicalData: state.historicalData,
        restaurantName: state.restaurantName,
      }),
    }
  )
);

const getMonthIndex = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months.indexOf(monthName);
};