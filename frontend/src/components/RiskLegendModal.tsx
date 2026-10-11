import React from 'react';
import { X, Shield, Wind, CloudRain, Snowflake, Weight, Award } from 'lucide-react';

interface RiskLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskLegendModal: React.FC<RiskLegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Weather Risk Classification & Methodology</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Risk Thresholds Table */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Standard Environmental Thresholds
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3 text-emerald-700">Low</th>
                  <th className="py-2.5 px-3 text-amber-700">Moderate</th>
                  <th className="py-2.5 px-3 text-orange-700">High</th>
                  <th className="py-2.5 px-3 text-red-700">Severe</th>
                  <th className="py-2.5 px-3 text-red-900 font-bold">No Travel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 flex items-center">
                    <Wind className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Wind
                  </td>
                  <td className="py-2.5 px-3">&lt; 25 mph</td>
                  <td className="py-2.5 px-3">25–34 mph</td>
                  <td className="py-2.5 px-3">35–44 mph</td>
                  <td className="py-2.5 px-3">45–54 mph</td>
                  <td className="py-2.5 px-3 font-bold text-red-700">&ge; 55 mph</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 flex items-center">
                    <CloudRain className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Rain
                  </td>
                  <td className="py-2.5 px-3">&lt; 0.10 in/hr</td>
                  <td className="py-2.5 px-3">0.10–0.25 in/hr</td>
                  <td className="py-2.5 px-3">0.25–0.50 in/hr</td>
                  <td className="py-2.5 px-3">0.50–1.00 in/hr</td>
                  <td className="py-2.5 px-3 font-bold text-red-700">&gt; 1.00 in/hr</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 flex items-center">
                    <Snowflake className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> Snow
                  </td>
                  <td className="py-2.5 px-3">&lt; 0.5 in/hr</td>
                  <td className="py-2.5 px-3">0.5–1.0 in/hr</td>
                  <td className="py-2.5 px-3">1.0–2.0 in/hr</td>
                  <td className="py-2.5 px-3">2.0–3.0 in/hr</td>
                  <td className="py-2.5 px-3 font-bold text-red-700">&gt; 3.0 in/hr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Load-Dependent Wind Overrides */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-purple-700 font-bold">
            <Weight className="w-4 h-4" />
            <span>Load-Dependent Dynamic Wind Safety Rules</span>
          </div>
          <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
            <li>
              <strong className="text-slate-900">&ge; 55 mph wind:</strong> Automatic <strong>No Travel</strong> regardless of load weight.
            </li>
            <li>
              <strong className="text-slate-900">45–54 mph wind + Load &gt; 30,000 lb:</strong> Elevated to <strong>No Travel</strong> (high lateral overturning risk on commercial trailers).
            </li>
            <li>
              <strong className="text-slate-900">35–44 mph wind + Load &gt; 40,000 lb:</strong> Elevated to <strong>Severe</strong>.
            </li>
          </ul>
        </div>

        {/* Lexicographical Ranking Order */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Strict Lexicographical Route Recommendation Priority</span>
          </div>
          <ol className="space-y-1 list-decimal list-inside text-slate-700">
            <li><strong className="text-slate-900">Fewest Severe miles:</strong> Absolute top safety priority.</li>
            <li><strong className="text-slate-900">Fewest High miles:</strong> Secondary hazard avoidance.</li>
            <li><strong className="text-slate-900">Lowest average risk:</strong> Segment-weighted exposure score.</li>
            <li><strong className="text-slate-900">Shortest travel times:</strong> Tie-breaker for routes with equivalent safety.</li>
          </ol>
          <p className="text-[11px] text-slate-500 pt-1">
            *Routes encountering No-Travel segments are disqualified from safe recommendation.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-2xs"
          >
            Close Rules
          </button>
        </div>
      </div>
    </div>
  );
};
