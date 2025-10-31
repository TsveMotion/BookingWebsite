"use client";

import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from "lucide-react";

interface ChartData {
  label: string;
  value: number;
}

interface EnhancedRevenueChartProps {
  data?: ChartData[];
  total?: number;
  change?: number;
}

export function EnhancedRevenueChart({ data = [], total = 0, change = 0 }: EnhancedRevenueChartProps) {
  const chartData = data.length > 0 ? data : [
    { label: "Mon", value: 0 },
    { label: "Tue", value: 0 },
    { label: "Wed", value: 0 },
    { label: "Thu", value: 0 },
    { label: "Fri", value: 0 },
    { label: "Sat", value: 0 },
    { label: "Sun", value: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white mb-1">
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
          <p className="text-3xl font-bold gradient-text">£{total.toFixed(2)}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E9B5D8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#E9B5D8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="label" 
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '12px',
              }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              itemStyle={{ color: '#E9B5D8' }}
              formatter={(value: number) => [`£${value.toFixed(2)}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#E9B5D8"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/10"
      >
        <Calendar className="w-4 h-4 text-lavender" />
        <span className="text-white/60 text-sm">Daily revenue tracking</span>
      </motion.div>
    </motion.div>
  );
}
