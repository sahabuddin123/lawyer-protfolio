import React, { useState, useEffect, useCallback } from 'react';
import { contactApi } from '@/api/contact';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import {
  ContactMessage,
  ContactMessageDetail,
  ConsultationRequest,
  ConsultationRequestDetail,
  ContactStatus,
  ConsultationStatus,
} from '@/types/contact';
import {
  Mail,
  Calendar,
  Search,
  Eye,
  Trash2,
  User,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const ContactInboxManager: React.FC = () => {
  const { showToast } = useToast();

  // Active section tab: 'messages' or 'consultations'
  const [activeTab, setActiveTab] = useState<'messages' | 'consultations'>('messages');

  // Lists state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal States
  const [activeMessage, setActiveMessage] = useState<ContactMessageDetail | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationRequestDetail | null>(null);

  // Notes & Status Editing State
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Deletion Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Contact Messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        per_page: 15,
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await contactApi.getAdminContactMessages(params);
      if (res.success && res.data) {
        setMessages(res.data);
        setTotalPages(res.meta?.last_page || 1);
        setTotalCount(res.meta?.total || res.data.length);
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to load contact messages' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, showToast]);

  // Fetch Consultations
  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        per_page: 15,
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await contactApi.getAdminConsultations(params);
      if (res.success && res.data) {
        setConsultations(res.data);
        setTotalPages(res.meta?.last_page || 1);
        setTotalCount(res.meta?.total || res.data.length);
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to load consultation requests' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, showToast]);

  // Trigger load on tab / filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, statusFilter]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    } else {
      fetchConsultations();
    }
  }, [activeTab, fetchMessages, fetchConsultations]);

  // Open Message Detail
  const handleOpenMessage = async (id: number) => {
    try {
      const res = await contactApi.getAdminContactMessage(id);
      if (res.success && res.data) {
        setActiveMessage(res.data);
        setEditStatus(res.data.status);
        setEditNotes(res.data.admin_notes || '');
        // Update list status to 'read' if it was 'new'
        setMessages((prev) =>
          prev.map((m) => (m.id === id && m.status === 'new' ? { ...m, status: 'read' } : m))
        );
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to load message details' });
    }
  };

  // Open Consultation Detail
  const handleOpenConsultation = async (id: number) => {
    try {
      const res = await contactApi.getAdminConsultation(id);
      if (res.success && res.data) {
        setActiveConsultation(res.data);
        setEditStatus(res.data.status);
        setEditNotes(res.data.admin_notes || '');
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to load consultation details' });
    }
  };

  // Update Status & Admin Notes for Message
  const handleSaveMessageUpdates = async () => {
    if (!activeMessage) return;
    try {
      setSavingNotes(true);
      const res = await contactApi.updateAdminContactMessage(activeMessage.id, {
        status: editStatus as ContactStatus,
        admin_notes: editNotes,
      });
      if (res.success && res.data) {
        setActiveMessage(res.data);
        showToast({ type: 'success', title: 'Contact message updated successfully' });
        fetchMessages();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to update contact message' });
    } finally {
      setSavingNotes(false);
    }
  };

  // Update Status & Admin Notes for Consultation
  const handleSaveConsultationUpdates = async () => {
    if (!activeConsultation) return;
    try {
      setSavingNotes(true);
      const res = await contactApi.updateAdminConsultation(activeConsultation.id, {
        status: editStatus as ConsultationStatus,
        admin_notes: editNotes,
      });
      if (res.success && res.data) {
        setActiveConsultation(res.data);
        showToast({ type: 'success', title: 'Consultation request updated successfully' });
        fetchConsultations();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to update consultation request' });
    } finally {
      setSavingNotes(false);
    }
  };

  // Execute Deletion
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      setDeleting(true);
      if (activeTab === 'messages') {
        await contactApi.deleteAdminContactMessage(deleteConfirmId);
        showToast({ type: 'success', title: 'Contact message soft-deleted' });
        if (activeMessage?.id === deleteConfirmId) setActiveMessage(null);
        fetchMessages();
      } else {
        await contactApi.deleteAdminConsultation(deleteConfirmId);
        showToast({ type: 'success', title: 'Consultation request soft-deleted' });
        if (activeConsultation?.id === deleteConfirmId) setActiveConsultation(null);
        fetchConsultations();
      }
      setDeleteConfirmId(null);
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to delete record' });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="gold">New</Badge>;
      case 'read':
        return <Badge variant="outline">Read</Badge>;
      case 'replied':
      case 'completed':
        return <Badge variant="success">{status === 'replied' ? 'Replied' : 'Completed'}</Badge>;
      case 'contacted':
      case 'scheduled':
      case 'in_progress':
        return <Badge variant="outline">{status.replace('_', ' ').toUpperCase()}</Badge>;
      case 'archived':
      case 'closed':
        return <Badge variant="neutral">Closed</Badge>;
      case 'spam':
        return <Badge variant="neutral">Spam</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            Client Inquiries & Consultations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage incoming citizen inquiries, case consultation requests, statuses, and private chamber notes.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-900 border border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('messages');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            General Messages
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('consultations');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'consultations'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Consultation Requests
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, subject..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 whitespace-nowrap">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            {activeTab === 'messages' ? (
              <>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
                <option value="spam">Spam</option>
              </>
            ) : (
              <>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
                <option value="spam">Spam</option>
              </>
            )}
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
            }}
            title="Reset filters"
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Datagrid */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading records...</span>
          </div>
        ) : activeTab === 'messages' ? (
          /* MESSAGES TABLE */
          messages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No contact messages found matching current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Sender</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {messages.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => handleOpenMessage(item.id)}
                    >
                      <td className="p-3.5 font-medium text-white flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {item.name}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div>{item.phone}</div>
                        {item.email && <div className="text-[11px] text-slate-500">{item.email}</div>}
                      </td>
                      <td className="p-3.5 text-slate-200 max-w-xs truncate">
                        {item.subject}
                      </td>
                      <td className="p-3.5">{getStatusBadge(item.status)}</td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenMessage(item.id)}
                          className="text-amber-400 hover:text-amber-300"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* CONSULTATIONS TABLE */
          consultations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No consultation requests found matching current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Phone / Email</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Preferred Schedule</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Submitted</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {consultations.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => handleOpenConsultation(item.id)}
                    >
                      <td className="p-3.5 font-medium text-white flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {item.name}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div>{item.phone}</div>
                        {item.email && <div className="text-[11px] text-slate-500">{item.email}</div>}
                      </td>
                      <td className="p-3.5 text-slate-200 max-w-xs truncate">
                        {item.subject}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {item.preferred_date ? (
                          <div className="flex items-center gap-1 text-amber-300">
                            <Calendar className="w-3 h-3" />
                            {item.preferred_date}
                          </div>
                        ) : (
                          <span className="text-slate-500">Unspecified</span>
                        )}
                        {item.preferred_time && (
                          <div className="text-[10px] text-slate-400">{item.preferred_time}</div>
                        )}
                      </td>
                      <td className="p-3.5">{getStatusBadge(item.status)}</td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenConsultation(item.id)}
                          className="text-amber-400 hover:text-amber-300"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {messages.length || consultations.length} of {totalCount} records
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MESSAGE DETAIL MODAL */}
      {activeMessage && (
        <Modal
          isOpen={true}
          onClose={() => setActiveMessage(null)}
          title={`Message Details #${activeMessage.id}`}
        >
          <div className="space-y-6 text-xs">
            {/* Meta bar */}
            <div className="p-3 rounded-xl bg-slate-950 border border-white/10 grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Sender</span>
                <span className="font-semibold text-white">{activeMessage.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Contact</span>
                <a href={`tel:${activeMessage.phone}`} className="text-amber-400 hover:underline block">
                  {activeMessage.phone}
                </a>
                {activeMessage.email && (
                  <a href={`mailto:${activeMessage.email}`} className="text-slate-400 hover:underline block text-[11px]">
                    {activeMessage.email}
                  </a>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Subject</span>
                <span className="text-white">{activeMessage.subject}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Received At</span>
                <span>{new Date(activeMessage.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Full Message Text
              </span>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                {activeMessage.message}
              </div>
            </div>

            {/* Status & Admin Notes Controls */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Chamber Administration Desk
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400">Status:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Private Admin Notes (Visible only to authorized chamber staff)
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record phone follow-ups, initial conflict checks, or internal chamber instructions..."
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(activeMessage.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Message
                </button>
                <Button
                  size="sm"
                  disabled={savingNotes}
                  onClick={handleSaveMessageUpdates}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {savingNotes ? 'Saving...' : 'Save Updates'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONSULTATION DETAIL MODAL */}
      {activeConsultation && (
        <Modal
          isOpen={true}
          onClose={() => setActiveConsultation(null)}
          title={`Consultation Request #${activeConsultation.id}`}
        >
          <div className="space-y-6 text-xs">
            {/* Meta bar */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Client Name</span>
                <span className="font-semibold text-white">{activeConsultation.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Contact</span>
                <a href={`tel:${activeConsultation.phone}`} className="text-amber-400 hover:underline block">
                  {activeConsultation.phone}
                </a>
                {activeConsultation.email && (
                  <a href={`mailto:${activeConsultation.email}`} className="text-slate-400 hover:underline block text-[11px]">
                    {activeConsultation.email}
                  </a>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Requested Date</span>
                <span className="text-amber-300 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {activeConsultation.preferred_date || 'Unspecified'}
                </span>
                {activeConsultation.preferred_time && (
                  <span className="text-[11px] text-slate-400">{activeConsultation.preferred_time}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Submission Date</span>
                <span>{new Date(activeConsultation.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Matter Subject & Message */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Matter Subject & Case Background
              </span>
              <div className="p-3 bg-slate-950 rounded-t-xl border-x border-t border-white/5 font-semibold text-white">
                {activeConsultation.subject}
              </div>
              <div className="p-4 rounded-b-xl bg-slate-950 border border-white/5 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                {activeConsultation.message}
              </div>
            </div>

            {/* Status & Admin Notes Controls */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Chamber Consultation Scheduling Desk
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400">Status:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Private Chamber Notes (Confidential)
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record conflict of interest check, fee discussion notes, or appointment confirmation details..."
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(activeConsultation.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Consultation
                </button>
                <Button
                  size="sm"
                  disabled={savingNotes}
                  onClick={handleSaveConsultationUpdates}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {savingNotes ? 'Saving...' : 'Save Updates'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Soft Deletion"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Are you sure you want to delete this {activeTab === 'messages' ? 'contact message' : 'consultation request'}?
              The record will be soft-deleted and can be recovered if necessary.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
