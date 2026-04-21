"use client";

import React from "react";
import { Link } from 'wouter';
import { Building2, Home, MessageSquare, TrendingUp, Plus, ArrowRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { formatPKR, getStatusColor } from "@/lib/utils";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useGetDashboardStats, useGetInquiries, useGetPlotsByStatus } from "@/lib/api";

const COLORS = ["#16a34a", "#ca8a04", "#dc2626", "#2563eb"];

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: inquiries } = useGetInquiries();
  const { data: plotsByStatus } = useGetPlotsByStatus();

  const recentInquiries = (inquiries ?? []).slice(-5).reverse();

  const chartData = (plotsByStatus ?? []).map((item: { status: string; count: number }) => ({
    name: item.status,
    value: item.count,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/admin/projects/new" className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700">
              <Plus size={14} /> Project
            </Link>
            <Link href="/admin/plots/new" className="flex items-center gap-1.5 bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-700">
              <Plus size={14} /> Plot
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Building2 size={18} className="text-red-600" />, label: "Total Projects", value: stats?.totalProjects, bg: "bg-red-50" },
            { icon: <Home size={18} className="text-green-600" />, label: "Available Plots", value: stats?.availablePlots, bg: "bg-green-50" },
            { icon: <Home size={18} className="text-blue-600" />, label: "Total Plots", value: stats?.totalPlots, bg: "bg-blue-50" },
            { icon: <MessageSquare size={18} className="text-orange-600" />, label: "New Inquiries", value: stats?.newInquiries, bg: "bg-orange-50" },
          ].map((card: { icon: React.ReactNode; label: string; value: number | undefined; bg: string }, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? <span className="w-12 h-7 bg-gray-200 animate-pulse rounded inline-block" /> : (card.value ?? 0)}
              </div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Value stat */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Value of Available Plots</div>
              <div className="text-xl font-bold text-gray-900">{formatPKR(stats.totalValue)}</div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Plot Status Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Plots by Status</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {chartData.map((_item: typeof chartData[0], i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [val, "Plots"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            )}
          </div>

          {/* Recent Inquiries */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Inquiries</h3>
              <Link href="/admin/inquiries" className="text-red-600 text-sm hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {recentInquiries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No inquiries yet</p>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq: { id: string; name: string; phone: string; status: string }) => (
                  <div key={inq.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{inq.name}</div>
                      <div className="text-xs text-gray-500">{inq.phone}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(inq.status)}`}>
                      {inq.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

