"use client";

import { useState } from "react";
import { Bell, Check, Trash2, ExternalLink, X } from "lucide-react";
import { Link } from 'wouter';
import { useGetNotifications, useGetUnreadCount, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const typeIcons: Record<string, string> = {
  inquiry: "📩",
  booking: "📋",
  payment: "💰",
  customer: "👤",
  system: "⚙️",
  default: "🔔",
};

const typeColors: Record<string, string> = {
  inquiry: "bg-blue-100 text-blue-700",
  booking: "bg-purple-100 text-purple-700",
  payment: "bg-green-100 text-green-700",
  customer: "bg-yellow-100 text-yellow-700",
  system: "bg-gray-100 text-gray-700",
  default: "bg-red-100 text-red-700",
};

export default function NotificationCenter() {
  const { data: notifications, isLoading } = useGetNotifications();
  const { data: unreadData } = useGetUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const [open, setOpen] = useState(false);

  const unreadCount = unreadData?.count || 0;
  const recentNotifications = (notifications || []).slice(0, 5);

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markRead.mutate({ id });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate({ id });
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentNotifications.map((n: Notification) => (
                <div
                  key={n.id}
                  className={`p-3 hover:bg-gray-50 transition-colors ${
                    !n.isRead ? "bg-red-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                        typeColors[n.type] || typeColors.default
                      }`}
                    >
                      {typeIcons[n.type] || typeIcons.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={getEntityLink(n.entityType, n.entityId)}
                        onClick={() => {
                          if (!n.isRead) markRead.mutate({ id: n.id });
                          setOpen(false);
                        }}
                        className="block"
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(n.createdAt)}
                        </p>
                      </Link>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!n.isRead && (
                        <button
                          onClick={(e) => handleMarkRead(n.id, e)}
                          disabled={markRead.isPending}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        disabled={deleteNotification.isPending}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="text-xs text-center text-gray-600 hover:text-gray-900 block py-1"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
