"use client";

import { useState } from "react";
import { Bell, Check, Trash2, Filter, CheckCheck, AlertCircle, Info, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "@/lib/utils";
import { Link } from 'wouter';
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  inquiry: <Info size={18} className="text-blue-600" />,
  booking: <Bell size={18} className="text-purple-600" />,
  payment: <CheckCircle size={18} className="text-green-600" />,
  customer: <Info size={18} className="text-yellow-600" />,
  system: <AlertCircle size={18} className="text-gray-600" />,
  default: <Bell size={18} className="text-red-600" />,
};

const typeColors: Record<string, string> = {
  inquiry: "bg-blue-50 border-blue-100",
  booking: "bg-purple-50 border-purple-100",
  payment: "bg-green-50 border-green-100",
  customer: "bg-yellow-50 border-yellow-100",
  system: "bg-gray-50 border-gray-100",
  default: "bg-red-50 border-red-100",
};

export default function AdminNotifications() {
  const { data: notifications, isLoading } = useGetNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const filteredNotifications = (notifications || []).filter((n: Notification) => {
    if (filter === "unread" && n.isRead) return false;
    if (typeFilter && n.type !== typeFilter) return false;
    return true;
  });

  const handleMarkRead = (id: string) => {
    markRead.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          toast({ title: "Marked as read" });
        },
      }
    );
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast({ title: "All notifications marked as read" });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this notification?")) return;
    deleteNotification.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          toast({ title: "Notification deleted" });
        },
      }
    );
  };

  const getEntityLink = (entityType: string, entityId: string) => {
    const links: Record<string, string> = {
      inquiry: `/admin/inquiries`,
      booking: `/admin/bookings`,
      customer: `/admin/customers`,
      project: `/admin/projects`,
      plot: `/admin/plots`,
    };
    return links[entityType] || "#";
  };

  const unreadCount = (notifications || []).filter((n: Notification) => !n.isRead).length;
  const uniqueTypes = [...new Set((notifications || []).map((n: Notification) => n.type))];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "No new notifications"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              <CheckCheck size={14} />
              {markAllRead.isPending ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">Filter:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {(filter !== "all" || typeFilter) && (
            <button
              onClick={() => {
                setFilter("all");
                setTypeFilter("");
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-gray-500">
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500">
                {filter === "unread" ? "You have no unread notifications." : "No notifications found matching your filters."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n: Notification) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  n.isRead
                    ? "border-gray-200 opacity-75"
                    : typeColors[n.type] || typeColors.default
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    {typeIcons[n.type] || typeIcons.default}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-medium ${n.isRead ? "text-gray-700" : "text-gray-900"}`}>
                          {n.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{formatDistanceToNow(n.createdAt)}</span>
                          <span className="text-gray-300">•</span>
                          <span className="capitalize">{n.type}</span>
                          {n.entityType && (
                            <>
                              <span className="text-gray-300">•</span>
                              <Link
                                href={getEntityLink(n.entityType, n.entityId)}
                                className="text-red-600 hover:underline"
                              >
                                View {n.entityType}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            disabled={markRead.isPending}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          disabled={deleteNotification.isPending}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
