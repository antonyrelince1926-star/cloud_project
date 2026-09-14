import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Clock, 
  Terminal,
  FileSpreadsheet
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchesResult = resultFilter === 'ALL' || log.result === resultFilter;

    return matchesSearch && matchesSeverity && matchesResult;
  });

  const exportLogsAsJson = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5ea] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5 text-[#e95d2a]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#222222] tracking-tight">
                Immutable SIEM Security Audit Trail
              </h1>
              <p className="text-xs text-[#6b7280]">
                Cryptographically anchored event stream • Forensic readiness • Zero-trust access telemetry
              </p>
            </div>
          </div>

          <button
            onClick={exportLogsAsJson}
            className="px-3.5 py-2 rounded-lg bg-[#222222] hover:bg-black text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#e95d2a]" />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 pt-4 border-t border-[#e5e5ea] flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6b7280] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, user, resource ID, or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-[#e5e5ea] rounded-lg text-xs bg-[#f4f4f6] focus:bg-white focus:ring-2 focus:ring-[#e95d2a] focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-[#6b7280] font-semibold">Severity:</span>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="px-2 py-1 border border-[#e5e5ea] rounded-md bg-white font-medium text-[#222222] text-xs focus:ring-1 focus:ring-[#e95d2a]"
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">INFO Only</option>
                <option value="WARNING">WARNING Only</option>
                <option value="CRITICAL">CRITICAL Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-[#6b7280] font-semibold">Result:</span>
              <select
                value={resultFilter}
                onChange={e => setResultFilter(e.target.value)}
                className="px-2 py-1 border border-[#e5e5ea] rounded-md bg-white font-medium text-[#222222] text-xs focus:ring-1 focus:ring-[#e95d2a]"
              >
                <option value="ALL">All Outcomes</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-[#e5e5ea] shadow-xs overflow-hidden">
        <div className="p-3.5 bg-[#f4f4f6]/50 border-b border-[#e5e5ea] flex items-center justify-between text-xs">
          <span className="font-bold text-[#222222]">
            Recorded Events ({filteredLogs.length} matching)
          </span>
          <span className="text-[11px] font-mono text-[#6b7280]">
            Append-Only Nonce-Chained Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f4f4f6] text-[#4b5563] border-b border-[#e5e5ea] font-semibold">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">User & Persona</th>
                <th className="py-2.5 px-3">Security Action</th>
                <th className="py-2.5 px-3">Resource Target</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5ea]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#f4f4f6]/40 transition">
                  <td className="py-2.5 px-3 font-mono text-[#6b7280] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#222222]">{log.userName}</div>
                    <div className="text-[10px] text-[#6b7280] font-mono">{log.role}</div>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-[#222222] bg-[#f4f4f6] px-1.5 py-0.5 rounded border border-[#e5e5ea]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[#4b5563]">
                    {log.resourceType}: {log.resourceId}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'CRITICAL' ? 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]' :
                      log.severity === 'WARNING' ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]' :
                      'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                    }`}>
                      {log.severity}
                    </span>
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center text-[11px] font-bold ${
                      log.result === 'SUCCESS' ? 'text-[#059669]' :
                      log.result === 'BLOCKED' ? 'text-[#e95d2a]' :
                      'text-[#dc2626]'
                    }`}>
                      {log.result === 'SUCCESS' && <CheckCircle className="w-3.5 h-3.5 mr-1 text-[#10b981]" />}
                      {log.result === 'BLOCKED' && <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#e95d2a]" />}
                      {log.result === 'FAILED' && <XCircle className="w-3.5 h-3.5 mr-1 text-[#dc2626]" />}
                      {log.result}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#6b7280]">
                    {log.ipAddress}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2 py-1 rounded bg-[#f4f4f6] hover:bg-[#e5e5ea] text-[#222222] font-semibold text-[11px]"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e5e5ea] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#222222] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-[#e95d2a]" />
                <h3 className="font-bold text-sm">Security Event Forensics</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-[#9ca3af] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#f4f4f6] p-3 rounded-lg border border-[#e5e5ea]">
                <div>
                  <span className="text-[#6b7280] font-bold block">EVENT ID:</span>
                  <span className="font-mono">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-[#6b7280] font-bold block">TIMESTAMP:</span>
                  <span className="font-mono">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[#6b7280] font-bold block">PRINCIPAL USER:</span>
                  <span>{selectedLog.userName} ({selectedLog.role})</span>
                </div>
                <div>
                  <span className="text-[#6b7280] font-bold block">CLIENT IP & AGENT:</span>
                  <span className="font-mono">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#222222] block mb-1">Payload Metadata & Forensic Context</label>
                <pre className="bg-[#222222] text-[#d4d4d8] p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-lg bg-[#222222] hover:bg-black text-white text-xs font-bold"
                >
                  Close Forensics Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
