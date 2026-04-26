"use client";

import { useState } from "react";
import { Activity, Filter, Download, User, Calendar, FileText, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

// Mock data - would be fetched from API
const mockLogs: LogEntry[] = [
];

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-700",
};

export default function AdminLogs() {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const { toast } = useToast();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !filter ||
      log.userName.toLowerCase().includes(filter.toLowerCase()) ||
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.entity.toLowerCase().includes(filter.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actions = [...new Set(logs.map((log) => log.action))];

  const handleExport = () => {
    const csv = [
      ["ID", "User", "Action", "Entity", "Details", "Date"].join(","),
      ...filteredLogs.map((log) =>
        [log.id, log.userName, log.action, log.entity, `"${log.details}"`, log.createdAt].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({ title: "Exported", description: "Activity logs exported to CSV" });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-500 text-sm mt-1">
              Track all admin actions and changes
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Activity size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search logs..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            {actionFilter && (
              <button
                onClick={() => setActionFilter("")}
                className="text-xs text-red-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">User</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Action</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Entity</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Details</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <Activity size={48} className="mx-auto text-gray-300 mb-3" />
                    <p>No activity logs yet</p>
                    <p className="text-xs mt-1">Actions will be logged here</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {log.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          actionColors[log.action] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-gray-400" />
                        <span className="text-gray-700">
                          {log.entity} #{log.entityId.slice(0, 6)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar size={12} />
                        <span className="text-xs">
                          {new Date(log.createdAt).toLocaleString("en-PK")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredLogs.length} of {logs.length} logs</span>
          <div className="flex gap-4">
            {actions.map((action) => (
              <span key={action} className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    actionColors[action]?.split(" ")[0].replace("bg-", "bg-opacity-50 bg-") || "bg-gray-300"
                  }`}
                />
                {action}: {logs.filter((l) => l.action === action).length}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
