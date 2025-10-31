"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { DollarSign, Calendar, Users, TrendingUp, Download, BarChart3, PieChart, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { PlanLock } from "@/components/analytics/PlanLock";
import { KpiCard } from "@/components/analytics/KpiCard";
import { EmptyState } from "@/components/analytics/EmptyState";
import toast, { Toaster } from "react-hot-toast";

interface KpiData {
  revenue: number;
  bookings: number;
  newClients: number;
  avgBookingValue: number;
  trends: {
    revenue: number;
    bookings: number;
    clients: number;
    avgValue: number;
  };
}

interface SeriesData {
  date: string;
  revenue: number;
  bookings: number;
}

interface ServiceMixData {
  name: string;
  value: number;
  bookings: number;
}

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
  const [serviceMix, setServiceMix] = useState<ServiceMixData[]>([]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserPlan();
      fetchAnalytics();
    }
  }, [isLoaded, user, dateRange]);

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setUserPlan(data.plan?.toLowerCase() || "free");
    } catch (error) {
      console.error("Failed to fetch user plan:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(dateRange));

      const [summaryRes, seriesRes, mixRes] = await Promise.all([
        fetch(`/api/analytics/summary?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`),
        fetch(`/api/analytics/revenue-series?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`),
        fetch(`/api/analytics/service-mix?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`),
      ]);

      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        setKpiData(summary);
      }

      if (seriesRes.ok) {
        const series = await seriesRes.json();
        setSeriesData(series.data || []);
      }

      if (mixRes.ok) {
        const mix = await mixRes.json();
        setServiceMix(mix.data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Generating CSV...");
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(dateRange));
      
      const response = await fetch(
        `/api/analytics/export?type=summary&from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}days.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.dismiss();
        toast.success("✅ CSV downloaded!");
      } else {
        toast.dismiss();
        toast.error("Export failed");
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.dismiss();
      toast.error("An error occurred");
    }
  };

  // Plan gating for Free users
  if (isLoaded && userPlan === "free") {
    return (
      <PlanLock 
        feature="Advanced Analytics" 
        requiredPlan="Pro"
        description="Unlock powerful insights to track revenue, bookings, client trends, and more. Make data-driven decisions to grow your business."
      />
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading analytics...
        </motion.div>
      </div>
    );
  }

  const COLORS = ['#E9B5D8', '#F4C2C2', '#FCD0A1', '#B8E0D2', '#D5AAFF'];
  const hasData = kpiData && (kpiData.revenue > 0 || kpiData.bookings > 0);

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
                Analytics
              </h1>
              <p className="text-white/60 text-lg">
                Track your business performance and growth
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              
              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-400 to-amber-300 text-white font-semibold rounded-xl shadow-lg shadow-rose-400/20 hover:shadow-rose-400/40 transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </motion.button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <KpiCard
              title="Total Revenue"
              value={`£${kpiData?.revenue?.toFixed(0) || '0'}`}
              icon={DollarSign}
              trend={kpiData?.trends.revenue ? {
                value: Math.abs(kpiData.trends.revenue),
                isPositive: kpiData.trends.revenue >= 0
              } : undefined}
              loading={loading}
            />
            <KpiCard
              title="Total Bookings"
              value={kpiData?.bookings || 0}
              icon={Calendar}
              trend={kpiData?.trends.bookings ? {
                value: Math.abs(kpiData.trends.bookings),
                isPositive: kpiData.trends.bookings >= 0
              } : undefined}
              loading={loading}
            />
            <KpiCard
              title="New Clients"
              value={kpiData?.newClients || 0}
              icon={Users}
              trend={kpiData?.trends.clients ? {
                value: Math.abs(kpiData.trends.clients),
                isPositive: kpiData.trends.clients >= 0
              } : undefined}
              loading={loading}
            />
            <KpiCard
              title="Avg Booking Value"
              value={`£${kpiData?.avgBookingValue?.toFixed(0) || '0'}`}
              icon={TrendingUp}
              trend={kpiData?.trends.avgValue ? {
                value: Math.abs(kpiData.trends.avgValue),
                isPositive: kpiData.trends.avgValue >= 0
              } : undefined}
              loading={loading}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-rose-400" />
                <h2 className="text-xl font-bold text-white">Revenue Trend</h2>
              </div>
              {hasData && seriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={seriesData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E9B5D8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#E9B5D8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`£${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#E9B5D8" 
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No revenue data"
                  description="Complete bookings to see revenue trends"
                />
              )}
            </div>

            {/* Bookings Trend */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Bookings Trend</h2>
              </div>
              {hasData && seriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={seriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [value, 'Bookings']}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="#FCD0A1"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No booking data"
                  description="Create bookings to see trends"
                />
              )}
            </div>
          </div>

          {/* Service Mix */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Service Mix</h2>
            </div>
            {hasData && serviceMix.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={240}>
                  <RechartsPie>
                    <Pie
                      data={serviceMix as any}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`£${value.toFixed(2)}`, 'Revenue']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-2">
                  {serviceMix.map((service, index) => (
                    <div key={service.name} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-white/80 text-sm flex-1">{service.name}</span>
                      <span className="text-white font-semibold text-sm">£{service.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={PieChart}
                title="No service data"
                description="Add services and complete bookings to see the mix"
              />
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
