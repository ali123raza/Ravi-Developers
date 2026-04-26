"use client";

import { useState } from "react";
import { Activity, Database, HardDrive, Server, Trash2, RefreshCw, Download, Zap, Shield, AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetSystemHealth, useGetSystemStats, useCreateBackup, useGetBackups, useClearCache } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminSystem() {
  const { data: health, isLoading: healthLoading } = useGetSystemHealth();
  const { data: stats, isLoading: statsLoading } = useGetSystemStats();
  const { data: backups, isLoading: backupsLoading } = useGetBackups();
  const createBackup = useCreateBackup();
  const clearCache = useClearCache();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"health" | "backups" | "integrations">("health");
  const [showBackupResult, setShowBackupResult] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);

  const handleCreateBackup = () => {
    createBackup.mutate(undefined, {
      onSuccess: (data) => {
        setBackupResult(data);
        setShowBackupResult(true);
        toast({ title: "Backup Created", description: data.type === "json_export" ? "Database exported successfully" : "Backup created successfully" });
      },
    });
  };

  const handleClearCache = () => {
    if (!confirm("Clear all cached data? This will refresh all data from the server.")) return;
    clearCache.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Cache Cleared", description: "All cached data has been cleared." });
      },
    });
  };

  const getStatusIcon = (status: string) => {
    if (status === "healthy") return <CheckCircle size={16} className="text-green-500" />;
    if (status === "warning") return <AlertCircle size={16} className="text-yellow-500" />;
    return <AlertCircle size={16} className="text-red-500" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System</h1>
            <p className="text-gray-500 text-sm mt-1">Health monitoring, backups & maintenance</p>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearCache.isPending}
            className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            <Trash2 size={14} /> {clearCache.isPending ? "Clearing..." : "Clear Cache"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: "health", label: "Health & Stats", icon: Activity },
            { key: "backups", label: "Backups", icon: Database },
            { key: "integrations", label: "Integrations", icon: Server },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === key ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Health Tab */}
        {activeTab === "health" && (
          <div className="space-y-6">
            {/* Database Health */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Database size={18} className="text-red-600" /> Database Health
              </h3>
              {healthLoading ? (
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(health?.database?.status)}
                      <span className="text-sm font-medium capitalize">{health?.database?.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">Database Status</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-bold">{health?.database?.latency}</div>
                    <div className="text-xs text-gray-500">Response Time</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-bold">{health?.database?.connections}</div>
                    <div className="text-xs text-gray-500">Active Connections</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-bold">{health?.tables?.length || 0}</div>
                    <div className="text-xs text-gray-500">Tables</div>
                  </div>
                </div>
              )}
            </div>

            {/* Table Sizes */}
            {health?.tables && health.tables.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <HardDrive size={18} className="text-red-600" /> Table Sizes
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Table</th>
                        <th className="px-4 py-2 text-right">Rows</th>
                        <th className="px-4 py-2 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {health.tables.map((table: any) => (
                        <tr key={table.name} className="border-t">
                          <td className="px-4 py-2 font-medium">{table.name}</td>
                          <td className="px-4 py-2 text-right">{table.rows?.toLocaleString() || "N/A"}</td>
                          <td className="px-4 py-2 text-right">{table.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* System Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Zap size={18} className="text-red-600" /> Entity Counts
              </h3>
              {statsLoading ? (
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: "projects", label: "Projects", color: "bg-blue-50 text-blue-700" },
                    { key: "plots", label: "Plots", color: "bg-green-50 text-green-700" },
                    { key: "bookings", label: "Bookings", color: "bg-purple-50 text-purple-700" },
                    { key: "customers", label: "Customers", color: "bg-yellow-50 text-yellow-700" },
                    { key: "inquiries", label: "Inquiries", color: "bg-pink-50 text-pink-700" },
                    { key: "users", label: "Users", color: "bg-indigo-50 text-indigo-700" },
                  ].map(({ key, label, color }) => (
                    <div key={key} className={`rounded-lg p-4 ${color.split(" ")[0]}`}>
                      <div className={`text-2xl font-bold ${color.split(" ")[1]}`}>
                        {stats?.counts?.[key] || 0}
                      </div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Storage */}
            {stats?.storage && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Server size={18} className="text-red-600" /> Storage
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-bold">{stats.storage.database}</div>
                  <div className="text-xs text-gray-500">Database Size</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backups Tab */}
        {activeTab === "backups" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Database Backups</h3>
                <p className="text-sm text-gray-500">Create and manage database backups</p>
              </div>
              <button
                onClick={handleCreateBackup}
                disabled={createBackup.isPending}
                className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                <Download size={14} /> {createBackup.isPending ? "Creating..." : "Create Backup"}
              </button>
            </div>

            {/* Backup Result Dialog */}
            <Dialog open={showBackupResult} onOpenChange={setShowBackupResult}>
              <DialogContent className="max-w-md">
                <DialogTitle className="sr-only">Backup Result</DialogTitle>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" /> Backup Complete
                  </h3>
                  {backupResult?.type === "json_export" ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Database exported successfully!</p>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between"><span>Tables:</span> <strong>{backupResult.tables}</strong></div>
                        <div className="flex justify-between"><span>Total Rows:</span> <strong>{backupResult.totalRows}</strong></div>
                      </div>
                      <p className="text-xs text-gray-500">The JSON data has been prepared for download.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">SQL backup created successfully!</p>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm font-mono">{backupResult?.filename}</div>
                    </div>
                  )}
                  <button
                    onClick={() => setShowBackupResult(false)}
                    className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm"
                  >
                    Close
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Backup File</th>
                    <th className="px-4 py-3 text-center font-semibold">Size</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {backupsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                    ))
                  ) : (backups ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No backups yet. <button onClick={handleCreateBackup} className="text-red-600 hover:underline">Create one.</button>
                      </td>
                    </tr>
                  ) : (
                    (backups ?? []).map((b: any) => (
                      <tr key={b.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Database size={14} className="text-gray-400" />
                            <span className="font-medium">{b.filename}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{b.size > 0 ? `${(b.size / 1024 / 1024).toFixed(2)} MB` : "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            b.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {new Date(b.createdAt).toLocaleString("en-PK")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Available Integrations</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "twilio", name: "Twilio SMS", icon: MessageSquare, desc: "Send SMS notifications via Twilio", color: "text-red-600" },
                { key: "sendgrid", name: "SendGrid Email", icon: Activity, desc: "Send transactional emails via SendGrid", color: "text-blue-600" },
                { key: "stripe", name: "Stripe Payments", icon: Shield, desc: "Accept online payments via Stripe", color: "text-purple-600" },
                { key: "easypaisa", name: "Easypaisa", icon: Zap, desc: "Pakistan local payment gateway", color: "text-green-600" },
                { key: "jazzcash", name: "JazzCash", icon: RefreshCw, desc: "Pakistan local payment gateway", color: "text-red-600" },
              ].map(({ key, name, icon: Icon, desc, color }) => (
                <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 ${color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500">{desc}</div>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Not Configured</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "Integration configuration coming in a future update." })}
                      className="flex-1 text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "Test functionality coming in a future update." })}
                      className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50"
                    >
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
