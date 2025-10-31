"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";

interface RevenueData {
  label: string;
  value: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
  total?: number;
  change?: number;
}

export function RevenueChart({ data = [], total = 0, change = 0 }: RevenueChartProps) {
  // Use provided data or fallback to empty state
  const chartData = data.length > 0 ? data : [
    { label: "Mon", value: 0 },
    { label: "Tue", value: 0 },
    { label: "Wed", value: 0 },
    { label: "Thu", value: 0 },
    { label: "Fri", value: 0 },
    { label: "Sat", value: 0 },
    { label: "Sun", value: 0 },
  ];
  
  const maxValue = Math.max(...chartData.map((d) => d.value), 1); // Ensure at least 1 to avoid division by zero
  const totalRevenue = total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-white mb-1">
            Weekly Revenue
          </h2>
          <p className="text-white/60 text-sm">Last 7 days performance</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm mb-1">
            <TrendingUp className={`w-4 h-4 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">£{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-48">
        {chartData.map((data: RevenueData, index: number) => {
          const height = (data.value / maxValue) * 100;
          return (
            <div key={data.label} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${height}%`, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 100 }}
                className="w-full relative group cursor-pointer"
              >
                {/* Bar */}
                <div className="absolute inset-0 bg-luxury-gradient rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                
                {/* Value tooltip on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: -10 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  £{data.value}
                </motion.div>
              </motion.div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="text-white/60 text-xs font-medium"
              >
                {data.label}
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10"
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-lavender" />
          <span className="text-white/60 text-sm">Revenue</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
