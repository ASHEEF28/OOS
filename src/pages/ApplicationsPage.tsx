import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  MapPin,
  Kanban,
  List
} from 'lucide-react';
import { 
  getStoredApplications, 
  saveStoredApplications, 
  getAllOpportunities, 
  updateApplicationStatus 
} from '../lib/storage';
import { ApplicationStatus, ApplicationItem } from '../types';
import { formatDate } from '../lib/utils';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>(getStoredApplications());
  const opportunities = getAllOpportunities();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Enrich applications with Opportunity entity
  const enrichedApplications = useMemo(() => {
    return applications.map(app => ({
      ...app,
      opportunity: opportunities.find(o => o.id === app.opportunity_id),
    })).filter(app => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const title = app.opportunity?.title.toLowerCase() || '';
      const org = app.opportunity?.organization.toLowerCase() || '';
      return title.includes(q) || org.includes(q);
    });
  }, [applications, opportunities, search]);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(appId, newStatus);
    setApplications(getStoredApplications());
  };

  const handleDelete = (appId: string) => {
    if (window.confirm('Remove this application record from tracker?')) {
      const updated = applications.filter(a => a.id !== appId);
      saveStoredApplications(updated);
      setApplications(updated);
    }
  };

  const handleSaveNotes = (appId: string) => {
    const item = applications.find(a => a.id === appId);
    if (item) {
      updateApplicationStatus(appId, item.status, tempNotes);
      setApplications(getStoredApplications());
      setEditingNotesId(null);
    }
  };

  const columns: { status: ApplicationStatus; label: string; color: string }[] = [
    { status: 'saved', label: 'Saved', color: 'border-slate-500 text-slate-300' },
    { status: 'planning', label: 'Planning to Apply', color: 'border-cyan-500 text-cyan-300' },
    { status: 'applied', label: 'Applied', color: 'border-purple-500 text-purple-300' },
    { status: 'interview', label: 'Interview', color: 'border-amber-500 text-amber-300' },
    { status: 'offer', label: 'Offer', color: 'border-emerald-500 text-emerald-300' },
    { status: 'rejected', label: 'Archived / Rejected', color: 'border-rose-500 text-rose-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-cyan-accent uppercase tracking-widest flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Workspace Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Application Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize bookmarks, deadlines, interview preparation, and external application links.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-midnight-surface p-1 rounded-xl border border-midnight-border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-midnight-bg text-cyan-accent shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-midnight-bg text-cyan-accent shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Link
            to="/opportunities"
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-midnight-bg font-bold text-xs transition-colors flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Find Opportunities</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter tracked applications..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-midnight-surface border border-midnight-border text-xs px-3 py-2 pl-9 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {columns.map(col => {
            const items = enrichedApplications.filter(a => a.status === col.status);

            return (
              <div key={col.status} className="bg-midnight-surface/60 rounded-2xl border border-midnight-border flex flex-col min-w-[220px]">
                
                {/* Column Header */}
                <div className={`p-3 border-b border-midnight-border flex items-center justify-between font-mono text-xs font-bold ${col.color}`}>
                  <span>{col.label}</span>
                  <span className="px-1.5 py-0.5 rounded bg-midnight-bg text-[10px] text-slate-400">
                    {items.length}
                  </span>
                </div>

                {/* Column Body Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[650px]">
                  {items.length === 0 ? (
                    <div className="text-[11px] text-slate-500 text-center py-8 font-mono">
                      No items
                    </div>
                  ) : (
                    items.map(app => (
                      <div
                        key={app.id}
                        className="bg-midnight-bg p-3.5 rounded-xl border border-midnight-border/80 hover:border-cyan-500/30 transition-all shadow-md space-y-2.5"
                      >
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {app.opportunity?.organization || 'Organization'}
                          </span>
                          <Link
                            to={`/opportunities/${app.opportunity_id}`}
                            className="font-bold text-xs text-white hover:text-cyan-accent transition-colors line-clamp-2"
                          >
                            {app.opportunity?.title || 'Opportunity'}
                          </Link>
                        </div>

                        {app.deadline && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-accent">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(app.deadline)}</span>
                          </div>
                        )}

                        {/* Notes preview or edit */}
                        {editingNotesId === app.id ? (
                          <div className="space-y-1">
                            <textarea
                              value={tempNotes}
                              onChange={e => setTempNotes(e.target.value)}
                              placeholder="Interview notes or links..."
                              className="w-full bg-midnight-surface border border-midnight-border rounded p-1.5 text-[10px] text-slate-200"
                            />
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="text-[10px] text-slate-400 hover:text-white px-1"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNotes(app.id)}
                                className="text-[10px] text-cyan-accent font-bold px-1"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between text-[11px] text-slate-400 bg-midnight-surface/50 p-1.5 rounded">
                            <span className="truncate italic">
                              {app.notes || 'No notes added'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingNotesId(app.id);
                                setTempNotes(app.notes || '');
                              }}
                              className="text-slate-500 hover:text-cyan-accent ml-1"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Status Switcher & External Link */}
                        <div className="pt-2 border-t border-midnight-border/60 flex items-center justify-between text-xs">
                          <select
                            value={app.status}
                            onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="bg-midnight-surface text-slate-300 text-[10px] rounded px-1.5 py-0.5 border border-midnight-border focus:outline-none"
                          >
                            <option value="saved">Saved</option>
                            <option value="planning">Planning</option>
                            <option value="applied">Applied</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            {app.opportunity?.application_url && (
                              <a
                                href={app.opportunity.application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open application link"
                                className="text-slate-400 hover:text-cyan-accent"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDelete(app.id)}
                              title="Delete from tracker"
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-midnight-surface rounded-2xl border border-midnight-border overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-midnight-bg text-[11px] font-mono uppercase text-slate-400 border-b border-midnight-border">
              <tr>
                <th className="p-4">Opportunity</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Status</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight-border">
              {enrichedApplications.map(app => (
                <tr key={app.id} className="hover:bg-midnight-hover/40 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <Link to={`/opportunities/${app.opportunity_id}`} className="hover:text-cyan-accent">
                      {app.opportunity?.title || 'Opportunity'}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-400">{app.opportunity?.organization}</td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="bg-midnight-bg text-slate-200 text-xs rounded-lg px-2 py-1 border border-midnight-border capitalize"
                    >
                      <option value="saved">Saved</option>
                      <option value="planning">Planning to Apply</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-amber-accent">
                    {formatDate(app.deadline)}
                  </td>
                  <td className="p-4 text-slate-400 truncate max-w-xs">{app.notes || '—'}</td>
                  <td className="p-4 text-right space-x-2">
                    {app.opportunity?.application_url && (
                      <a
                        href={app.opportunity.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block p-1 text-slate-400 hover:text-cyan-accent"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
