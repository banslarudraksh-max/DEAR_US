import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditLogEntry } from '../../types';
import { 
  Activity, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  Calendar, 
  User, 
  AlertTriangle, 
  X,
  FileText
} from 'lucide-react';

interface AdminActivityLogProps {
  logs: AuditLogEntry[];
  onClearLogs: () => Promise<void>;
}

export const AdminActivityLog: React.FC<AdminActivityLogProps> = ({
  logs,
  onClearLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch = !q || (
        Boolean(log.summary && log.summary.toLowerCase().includes(q)) ||
        Boolean(log.entityTitle && log.entityTitle.toLowerCase().includes(q)) ||
        Boolean(log.adminUser && log.adminUser.toLowerCase().includes(q))
      );

      const matchesAction = selectedAction === 'all' || log.action === selectedAction;
      const matchesEntity = selectedEntity === 'all' || log.entity === selectedEntity;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, searchTerm, selectedAction, selectedEntity]);

  const handleExportJson = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dearus-activity-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Entity', 'Entity Title', 'Admin User', 'Summary'];
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      l.action,
      l.entity,
      `"${(l.entityTitle || '').replace(/"/g, '""')}"`,
      `"${l.adminUser.replace(/"/g, '""')}"`,
      `"${l.summary.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dearus-activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Administrative Audit Trail
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Immutable tracking of memory modifications, future letter seals, CMS edits, and vault activities.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFBF99]/30 bg-[#250D29] px-3.5 py-2 text-xs font-medium text-[#DFBF99] hover:bg-[#35123A] transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFBF99]/30 bg-[#250D29] px-3.5 py-2 text-xs font-medium text-[#DFBF99] hover:bg-[#35123A] transition"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/60 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/80 p-3 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs by description, title, or admin partner..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="rounded-xl border border-[#DFBF99]/25 bg-[#120514] px-3 py-2 text-xs text-[#FAF7F2] focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="config">Config</option>
          </select>

          {/* Entity Filter */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="rounded-xl border border-[#DFBF99]/25 bg-[#120514] px-3 py-2 text-xs text-[#FAF7F2] focus:outline-none"
          >
            <option value="all">All Entities</option>
            <option value="Memory">Memories</option>
            <option value="Timeline">Timeline</option>
            <option value="Letter">Letters</option>
            <option value="Capsule">Capsules</option>
            <option value="Place">Places</option>
            <option value="BucketList">Bucket List</option>
            <option value="Countdown">Countdowns</option>
            <option value="SpecialDate">Special Dates</option>
            <option value="CMS">CMS</option>
            <option value="Category">Categories</option>
            <option value="Mood">Moods</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#FAF7F2]">
            <thead className="border-b border-[#DFBF99]/15 bg-[#200A23]/80 text-[#DFBF99] font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Record Title</th>
                <th className="py-3.5 px-4">Admin User</th>
                <th className="py-3.5 px-4">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFBF99]/10">
              {filteredLogs.map((log) => {
                const actionBadgeColor = 
                  log.action === 'create' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40' :
                  log.action === 'update' ? 'bg-blue-950/60 text-blue-300 border-blue-700/40' :
                  log.action === 'delete' ? 'bg-rose-950/60 text-rose-300 border-rose-700/40' :
                  'bg-amber-950/60 text-amber-300 border-amber-700/40';

                return (
                  <tr key={log.id} className="hover:bg-[#200A24]/60 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#8F7D8A] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${actionBadgeColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[#DFBF99]">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-[#FAF7F2] max-w-[180px] truncate">
                      {log.entityTitle ? `"${log.entityTitle}"` : '&mdash;'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#C9B7C3]">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-[#DFBF99]" />
                        <span>{log.adminUser}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8F7D8A] max-w-sm truncate font-sans">
                      {log.summary}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {isClearConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1D081F] p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-700/40">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal mb-2">
                Clear All Audit Logs?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will reset the activity log history. (We recommend exporting a CSV backup first).
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onClearLogs();
                    setIsClearConfirmOpen(false);
                  }}
                  className="rounded-xl border border-rose-500/50 bg-rose-700 px-5 py-2.5 text-xs font-medium text-white hover:bg-rose-600 transition"
                >
                  Confirm Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
