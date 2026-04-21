import { useState } from "react";
import { X, Eye, MessageSquare, MapPin, Tag } from "lucide-react";
import { formatPKR, getStatusColor } from "@/lib/utils";
import InquiryForm from "./InquiryForm";

interface PlotCell {
  id: string;
  plotNumber: string;
  size: string;
  type: string;
  price: number;
  status: string;
  area: number;
  facing?: string | null;
  category?: string | null;
  isCorner: boolean;
  mapBlock?: string | null;
  mapRow?: number | null;
  mapCol?: number | null;
  projectName?: string | null;
}

interface Props {
  plots: PlotCell[];
  projectName?: string;
  onVirtualTour?: (plot: PlotCell) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-green-400 hover:bg-green-500 border-green-600",
  Booked: "bg-yellow-400 hover:bg-yellow-500 border-yellow-600",
  Reserved: "bg-orange-400 hover:bg-orange-500 border-orange-600",
  Sold: "bg-red-400 hover:bg-red-500 border-red-600",
};

const STATUS_TEXT: Record<string, string> = {
  Available: "text-green-800",
  Booked: "text-yellow-800",
  Reserved: "text-orange-800",
  Sold: "text-red-800",
};

export default function PlotMap2D({ plots, projectName, onVirtualTour }: Props) {
  const [selectedPlot, setSelectedPlot] = useState<PlotCell | null>(null);
  const [showInquiry, setShowInquiry] = useState(false);

  const blocks = Array.from(new Set(plots.map((p) => p.mapBlock || "A"))).sort();

  const getPlotsByBlock = (block: string) => {
    const blockPlots = plots.filter((p) => (p.mapBlock || "A") === block);
    const maxRow = Math.max(...blockPlots.map((p) => p.mapRow ?? 0), 0);
    const maxCol = Math.max(...blockPlots.map((p) => p.mapCol ?? 0), 0);

    const grid: (PlotCell | null)[][] = Array.from({ length: Math.max(maxRow, 1) }, () =>
      Array.from({ length: Math.max(maxCol, 1) }, () => null)
    );

    for (const plot of blockPlots) {
      const row = (plot.mapRow ?? 1) - 1;
      const col = (plot.mapCol ?? 1) - 1;
      if (row >= 0 && col >= 0 && row < grid.length && col < grid[0].length) {
        grid[row][col] = plot;
      }
    }
    return { grid, blockPlots };
  };

  const statusCounts = {
    Available: plots.filter((p) => p.status === "Available").length,
    Booked: plots.filter((p) => p.status === "Booked").length,
    Reserved: plots.filter((p) => p.status === "Reserved").length,
    Sold: plots.filter((p) => p.status === "Sold").length,
  };

  if (plots.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-gray-400">
        No plots available for map view
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Legend:</span>
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded border ${cls.split(" ")[0]} ${cls.split(" ")[2]}`} />
            <span className="text-xs text-gray-700">{status} ({statusCounts[status as keyof typeof statusCounts] ?? 0})</span>
          </div>
        ))}
        {projectName && (
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} /> {projectName}
          </div>
        )}
      </div>

      {/* Map Blocks */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-2">
          <MapPin size={14} className="text-red-400" />
          <span className="font-semibold text-sm">2D Plot Map — {projectName || "Housing Society"}</span>
          <span className="ml-auto text-xs text-gray-400">Click on a plot to view details</span>
        </div>

        <div className="p-4 overflow-auto">
          {/* Main Boulevard */}
          <div className="w-full bg-green-200 border border-green-400 rounded text-center py-1.5 text-xs font-bold text-green-800 mb-3">
            MAIN BOULEVARD 80' WIDE
          </div>

          {blocks.map((block) => {
            const { grid, blockPlots } = getPlotsByBlock(block);
            if (blockPlots.length === 0) return null;

            return (
              <div key={block} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded">
                    Block {block}
                  </span>
                  <span className="text-xs text-gray-500">
                    {blockPlots.filter((p) => p.status === "Available").length} available of {blockPlots.length} plots
                  </span>
                </div>

                {grid.length > 0 ? (
                  <div className="inline-block border border-gray-300 rounded overflow-hidden">
                    {grid.map((row, ri) => (
                      <div key={ri} className="flex">
                        {row.map((cell, ci) => (
                          <div
                            key={ci}
                            onClick={() => cell && setSelectedPlot(cell)}
                            className={`
                              w-14 h-12 border border-white/50 flex flex-col items-center justify-center cursor-pointer
                              transition-all relative
                              ${cell
                                ? STATUS_COLORS[cell.status] || "bg-gray-300 hover:bg-gray-400"
                                : "bg-gray-100 cursor-default"
                              }
                              ${cell?.isCorner ? "ring-1 ring-blue-500 ring-inset" : ""}
                            `}
                            title={cell ? `${cell.plotNumber} | ${cell.size} | ${cell.status}` : ""}
                          >
                            {cell ? (
                              <>
                                <span className="text-xs font-bold text-gray-900 leading-none">
                                  {cell.plotNumber}
                                </span>
                                <span className="text-[9px] text-gray-700 leading-none mt-0.5">
                                  {cell.size}
                                </span>
                                {cell.isCorner && (
                                  <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-bl" title="Corner Plot" />
                                )}
                              </>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {blockPlots.map((plot) => (
                      <div
                        key={plot.id}
                        onClick={() => setSelectedPlot(plot)}
                        className={`
                          w-14 h-12 border border-white/50 flex flex-col items-center justify-center
                          cursor-pointer transition-all rounded relative
                          ${STATUS_COLORS[plot.status] || "bg-gray-300 hover:bg-gray-400"}
                          ${plot.isCorner ? "ring-1 ring-blue-500 ring-inset" : ""}
                        `}
                        title={`${plot.plotNumber} | ${plot.size} | ${plot.status}`}
                      >
                        <span className="text-xs font-bold text-gray-900 leading-none">{plot.plotNumber}</span>
                        <span className="text-[9px] text-gray-700 leading-none mt-0.5">{plot.size}</span>
                        {plot.isCorner && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-bl" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Road between blocks */}
                <div className="mt-2 w-full bg-gray-200 border border-gray-300 rounded text-center py-0.5 text-[10px] font-medium text-gray-500">
                  ROAD 30' WIDE
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plot Detail Popup */}
      {selectedPlot && !showInquiry && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlot(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-5 py-4 ${selectedPlot.status === "Available" ? "bg-green-600" : selectedPlot.status === "Sold" ? "bg-red-600" : "bg-yellow-500"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-bold text-xl">{selectedPlot.plotNumber}</div>
                  <div className="text-white/80 text-sm">{selectedPlot.projectName || projectName || "Ravi Developers"}</div>
                </div>
                <button onClick={() => setSelectedPlot(null)} className="text-white/70 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className={`inline-flex items-center gap-1 mt-2 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
                {selectedPlot.status}
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Size</div>
                  <div className="font-semibold text-gray-900">{selectedPlot.size}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="font-semibold text-gray-900">{selectedPlot.type}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Area</div>
                  <div className="font-semibold text-gray-900">{selectedPlot.area.toLocaleString()} sq.ft</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="font-semibold text-red-600">{formatPKR(selectedPlot.price)}</div>
                </div>
              </div>

              {(selectedPlot.facing || selectedPlot.category || selectedPlot.isCorner) && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlot.isCorner && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Corner Plot
                    </span>
                  )}
                  {selectedPlot.facing && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {selectedPlot.facing} Facing
                    </span>
                  )}
                  {selectedPlot.category && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      Cat. {selectedPlot.category}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {onVirtualTour && (
                  <button
                    onClick={() => {
                      onVirtualTour(selectedPlot);
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                  >
                    <Eye size={15} />
                    Virtual Tour
                  </button>
                )}
                {selectedPlot.status === "Available" && (
                  <button
                    onClick={() => setShowInquiry(true)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                  >
                    <MessageSquare size={15} />
                    Book This Plot
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlot(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm py-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiry && selectedPlot && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => { setShowInquiry(false); setSelectedPlot(null); }}
        >
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <InquiryForm plotId={selectedPlot.id} title={`Book Plot ${selectedPlot.plotNumber}`} />
            <button
              onClick={() => { setShowInquiry(false); setSelectedPlot(null); }}
              className="mt-2 w-full text-white text-sm py-2 hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
