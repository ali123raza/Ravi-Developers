import { useState } from "react";
import { Calculator } from "lucide-react";

function formatPKR(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Crore`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(2)} Lac`;
  return amount.toLocaleString("en-PK");
}

export default function InstallmentCalculator({ defaultPrice }: { defaultPrice?: number }) {
  const [totalPrice, setTotalPrice] = useState(defaultPrice ?? 3750000);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [years, setYears] = useState(4);

  const downPayment = (totalPrice * downPaymentPct) / 100;
  const remaining = totalPrice - downPayment;
  const monthlyPayment = remaining / (years * 12);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-red-600" />
        <h3 className="font-bold text-gray-900">Installment Calculator</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-600 font-medium">Total Price (PKR)</label>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 font-medium">Down Payment: {downPaymentPct}%</label>
          <input
            type="range" min={10} max={50} step={5}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            className="w-full mt-1 accent-red-600"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 font-medium">Installment Period: {years} Years</label>
          <input
            type="range" min={1} max={4} step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full mt-1 accent-red-600"
          />
        </div>
      </div>
      <div className="mt-4 space-y-2 p-4 bg-white rounded border border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Down Payment ({downPaymentPct}%)</span>
          <span className="font-semibold">PKR {formatPKR(downPayment)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Remaining Amount</span>
          <span className="font-semibold">PKR {formatPKR(remaining)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
          <span className="text-sm font-semibold text-gray-700">Monthly Installment</span>
          <span className="text-red-600 font-bold text-lg">PKR {formatPKR(monthlyPayment)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">*Indicative calculation. Contact us for exact payment plans.</p>
    </div>
  );
}
