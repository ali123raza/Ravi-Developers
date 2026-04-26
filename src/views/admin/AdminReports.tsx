"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Download, Calendar, PieChart, Building2, MessageSquare, Users } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { formatPKR } from "@/lib/utils";
import { useGetSalesReport, useGetInquiryReport, useGetPlotsReport, useGetSummaryReport } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from "recharts";

const COLORS = ["#16a34a", "#ca8a04", "#dc2626", "#2563eb", "#9333ea"];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<"sales" | "inquiries" | "plots">("sales");
  const { toast } = useToast();

  const { data: salesReport, isLoading: salesLoading } = useGetSalesReport();
  const { data: inquiryReport, isLoading: inquiryLoading } = useGetInquiryReport();
  const { data: plotsReport, isLoading: plotsLoading } = useGetPlotsReport();
  const { data: summary, isLoading: summaryLoading } = useGetSummaryReport();

  const handleExport = () => {
    // Prepare data based on active tab
    let csvContent = "";
    let filename = "";

    if (activeTab === "sales" && salesReport) {
      filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = "Month,Revenue,Bookings\n";
      (salesReport.monthly || []).forEach((item: any) => {
        csvContent += `${item.month},${item.totalAmount},${item.totalBookings}\n`;
      });
      csvContent += "\nProject,Revenue,Bookings\n";
      (salesReport.byProject || []).forEach((item: any) => {
        csvContent += `${item.projectName},${item.totalRevenue},${item.totalBookings}\n`;
      });
    } else if (activeTab === "inquiries" && inquiryReport) {
      filename = `inquiry-report-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = "Metric,Value\n";
      csvContent += `Total Inquiries,${inquiryReport.summary?.totalInquiries || 0}\n`;
      csvContent += `Converted to Customers,${inquiryReport.summary?.convertedToCustomers || 0}\n`;
      csvContent += `Conversion Rate,${inquiryReport.summary?.conversionRate || 0}%\n\n`;
      csvContent += "Status,Count\n";
      (inquiryReport.byStatus || []).forEach((item: any) => {
        csvContent += `${item.status},${item.count}\n`;
      });
    } else if (activeTab === "plots" && plotsReport) {
      filename = `plots-report-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = "Status,Count\n";
      (plotsReport.byStatus || []).forEach((item: any) => {
        csvContent += `${item.status},${item.count}\n`;
      });
      csvContent += "\nProject,Total,Available,Booked,Sold\n";
      (plotsReport.byProject || []).forEach((item: any) => {
        csvContent += `${item.projectName},${item.totalPlots},${item.available},${item.booked},${item.sold}\n`;
      });
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Export Complete", description: `${filename} downloaded successfully.` });
    } else {
      toast({ title: "Export Failed", description: "No data available to export.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">View business insights and statistics</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
          >
            <Download size={14} /> Export
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} className="text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryLoading ? "—" : formatPKR(summary?.thisMonth?.revenue || 0)}
                </div>
                <div className="text-sm text-gray-500">This Month Revenue</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryLoading ? "—" : summary?.thisMonth?.bookings || 0}
                </div>
                <div className="text-sm text-gray-500">This Month Bookings</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <MessageSquare size={18} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryLoading ? "—" : summary?.thisMonth?.inquiries || 0}
                </div>
                <div className="text-sm text-gray-500">New Inquiries</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summaryLoading ? "—" : summary?.totals?.customers || 0}
                </div>
                <div className="text-sm text-gray-500">Total Customers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: "sales", label: "Sales Report", icon: BarChart3 },
            { key: "inquiries", label: "Inquiries", icon: MessageSquare },
            { key: "plots", label: "Plots", icon: Building2 },
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

        {/* Sales Report */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            {salesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Monthly Sales Chart */}
                {salesReport?.monthly && salesReport.monthly.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Monthly Sales</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesReport.monthly}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(val) => `PKR ${val / 1000}k`} />
                          <Tooltip formatter={(val) => formatPKR(val as number)} />
                          <Bar dataKey="totalAmount" fill="#dc2626" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Project Performance */}
                {salesReport?.byProject && salesReport.byProject.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenue by Project</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {salesReport.byProject.map((project: any) => (
                        <div key={project.projectName} className="border border-gray-100 rounded-lg p-4">
                          <div className="text-sm text-gray-500">{project.projectName}</div>
                          <div className="text-xl font-bold text-gray-900">{formatPKR(project.totalRevenue)}</div>
                          <div className="text-sm text-gray-600">{project.totalBookings} bookings</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Status */}
                {salesReport?.byStatus && salesReport.byStatus.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Payment Status</h3>
                    <div className="flex flex-wrap gap-4">
                      {salesReport.byStatus.map((status: any) => (
                        <div key={status.status} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              status.status === "paid"
                                ? "bg-green-500"
                                : status.status === "partial"
                                ? "bg-yellow-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">{status.status}</div>
                            <div className="text-xs text-gray-500">{status.count} bookings</div>
                            <div className="text-sm font-semibold">{formatPKR(status.totalAmount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Inquiries Report */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            {inquiryLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Summary */}
                {inquiryReport?.summary && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-gray-900">{inquiryReport.summary.totalInquiries}</div>
                        <div className="text-sm text-gray-500">Total Inquiries</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-700">{inquiryReport.summary.convertedToCustomers}</div>
                        <div className="text-sm text-gray-500">Converted</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-700">
                          {inquiryReport.summary.conversionRate}%
                        </div>
                        <div className="text-sm text-gray-500">Conversion Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Trend */}
                {inquiryReport?.monthly && inquiryReport.monthly.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Monthly Inquiry Trends</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[...inquiryReport.monthly].reverse()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="totalInquiries" fill="#dc2626" name="Inquiries" />
                          <Bar dataKey="convertedInquiries" fill="#16a34a" name="Converted" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Status Breakdown */}
                {inquiryReport?.byStatus && inquiryReport.byStatus.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {inquiryReport.byStatus.map((status: any) => (
                        <div key={status.status} className="text-center p-3 border border-gray-100 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{status.count}</div>
                          <div className="text-sm text-gray-500 capitalize">{status.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Plots Report */}
        {activeTab === "plots" && (
          <div className="space-y-6">
            {plotsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Status Distribution */}
                {plotsReport?.byStatus && plotsReport.byStatus.length > 0 && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Plot Status Distribution</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={plotsReport.byStatus}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              dataKey="count"
                            >
                              {plotsReport.byStatus.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Status Counts</h3>
                      <div className="space-y-3">
                        {plotsReport.byStatus.map((status: any, index: number) => (
                          <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium capitalize">{status.status}</span>
                            </div>
                            <span className="text-xl font-bold">{status.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* By Project */}
                {plotsReport?.byProject && plotsReport.byProject.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Plots by Project</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Project</th>
                            <th className="px-4 py-2 text-center">Total</th>
                            <th className="px-4 py-2 text-center">Available</th>
                            <th className="px-4 py-2 text-center">Booked</th>
                            <th className="px-4 py-2 text-center">Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plotsReport.byProject.map((project: any) => (
                            <tr key={project.projectName} className="border-t">
                              <td className="px-4 py-3 font-medium">{project.projectName}</td>
                              <td className="px-4 py-3 text-center">{project.totalPlots}</td>
                              <td className="px-4 py-3 text-center text-green-600">{project.available}</td>
                              <td className="px-4 py-3 text-center text-yellow-600">{project.booked}</td>
                              <td className="px-4 py-3 text-center text-red-600">{project.sold}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* By Type */}
                {plotsReport?.byType && plotsReport.byType.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Plots by Type</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {plotsReport.byType.map((type: any) => (
                        <div key={type.type} className="text-center p-4 border border-gray-100 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{type.count}</div>
                          <div className="text-sm text-gray-500">{type.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
