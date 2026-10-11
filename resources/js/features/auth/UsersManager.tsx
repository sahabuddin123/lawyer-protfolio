import React, { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/api/users';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { AdminPageHeader, AdminEmptyState, AdminConfirmationDialog } from '@/components/admin';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  UserCheck,
  UserX,
  Lock,
  Key,
  Calendar,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import type { User, RoleName } from '@/types';

export const UsersManager: React.FC = () => {
  const { user: currentUser, hasRole } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Role Management Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<RoleName[]>([]);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant?: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  const isCurrentSuperAdmin = Boolean(currentUser && hasRole('super_admin'));

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await usersApi.getUsers({
        page: currentPage,
        per_page: 15,
        q: searchQuery.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      const userList = Array.isArray(res?.data) ? res.data : [];
      setUsers(userList);
      if (res?.meta) {
        setTotalPages(res.meta.last_page || 1);
        setTotalUsers(res.meta.total || userList.length);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Loading Administrators',
        message: err?.response?.data?.message || err.message || 'Failed to retrieve administrative users.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, roleFilter, statusFilter, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open Role Edit Modal
  const handleOpenRoleModal = (targetUser: User) => {
    setSelectedUser(targetUser);
    setSelectedRoles([...targetUser.roles]);
    setIsRoleModalOpen(true);
  };

  // Toggle Role in selection
  const handleToggleRole = (roleName: RoleName) => {
    if (roleName === 'super_admin' && !isCurrentSuperAdmin) {
      showToast({
        type: 'info',
        title: 'Restricted Action',
        message: 'Only a Super Administrator can assign or revoke the super_admin role.',
      });
      return;
    }

    // Anti-lockout: prevent removing own super_admin role
    if (selectedUser?.id === currentUser?.id && roleName === 'super_admin' && selectedRoles.includes('super_admin')) {
      showToast({
        type: 'info',
        title: 'Anti-Lockout Protection',
        message: 'You cannot revoke your own Super Administrator role.',
      });
      return;
    }

    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  // Save Roles
  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    if (selectedRoles.length === 0) {
      showToast({
        type: 'error',
        title: 'Role Required',
        message: 'Each administrator must possess at least one assigned role.',
      });
      return;
    }

    try {
      setIsSavingRoles(true);
      await usersApi.updateUserRoles(selectedUser.id, selectedRoles);
      showToast({
        type: 'success',
        title: 'Roles Updated',
        message: `Successfully updated roles for ${selectedUser.name}.`,
      });
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.response?.data?.message || err.message || 'Failed to update user roles.',
      });
    } finally {
      setIsSavingRoles(false);
    }
  };

  // Toggle User Active Status with confirmation
  const handleToggleStatus = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      showToast({
        type: 'error',
        title: 'Operation Prohibited',
        message: 'You cannot deactivate your own administrative account.',
      });
      return;
    }

    if (targetUser.roles.includes('super_admin') && !isCurrentSuperAdmin) {
      showToast({
        type: 'error',
        title: 'Access Restricted',
        message: 'Only a Super Administrator can deactivate another Super Administrator.',
      });
      return;
    }

    const willActivate = !targetUser.is_active;

    setConfirmDialog({
      isOpen: true,
      title: willActivate ? 'Reactivate Administrator Account' : 'Deactivate Administrator Account',
      message: willActivate
        ? `Are you sure you want to reactivate access for ${targetUser.name} (${targetUser.email})?`
        : `Are you sure you want to deactivate ${targetUser.name} (${targetUser.email})? Their active login sessions and API tokens will be revoked immediately.`,
      variant: willActivate ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await usersApi.updateUserStatus(targetUser.id, willActivate);
          showToast({
            type: 'success',
            title: willActivate ? 'Account Activated' : 'Account Deactivated',
            message: `${targetUser.name} has been ${willActivate ? 'activated' : 'deactivated'}.`,
          });
          fetchUsers();
        } catch (err: any) {
          showToast({
            type: 'error',
            title: 'Action Failed',
            message: err?.response?.data?.message || err.message || 'Failed to change user status.',
          });
        }
      },
    });
  };

  // Render role badge with judicial palette
  const renderRoleBadge = (role: RoleName) => {
    switch (role) {
      case 'super_admin':
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 border border-amber-500/30 font-mono"
          >
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-700 border border-indigo-500/30 font-mono"
          >
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            Admin
          </span>
        );
      case 'content_manager':
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 font-mono"
          >
            <Key className="w-3 h-3 text-emerald-600" />
            Content Manager
          </span>
        );
      case 'editor':
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-700 border border-blue-500/30 font-mono"
          >
            <Key className="w-3 h-3 text-blue-600" />
            Reviewer / Editor
          </span>
        );
      case 'media_manager':
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-700 border border-purple-500/30 font-mono"
          >
            <Key className="w-3 h-3 text-purple-600" />
            Media Manager
          </span>
        );
      default:
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300 font-mono"
          >
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Administrators & Roles"
        description="Manage chamber administrative personnel, assigned access tiers, and security credentials"
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96">
          <Input
            id="user-search"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center">
          <div className="w-44">
            <Select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'super_admin', label: 'Super Admin' },
                { value: 'admin', label: 'Admin' },
                { value: 'content_manager', label: 'Content Manager' },
                { value: 'editor', label: 'Reviewer / Editor' },
                { value: 'media_manager', label: 'Media Manager' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' },
              ]}
            />
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('all');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* User Table / List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-sans">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Verifying judicial personnel directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={<Users className="w-10 h-10 text-slate-400" />}
              title="No Administrators Found"
              description="No administrative personnel match your search and filter criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-mono uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Assigned Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((adminUser) => {
                  const isSelf = adminUser.id === currentUser?.id;
                  const isTargetSuper = adminUser.roles.includes('super_admin');

                  return (
                    <tr key={adminUser.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-serif font-bold flex items-center justify-center text-xs shadow-xs border border-amber-500/30 flex-shrink-0">
                            {adminUser.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{adminUser.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{adminUser.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {adminUser.roles.map((r) => renderRoleBadge(r))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {adminUser.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                        {adminUser.last_login_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(adminUser.last_login_at).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Never logged in</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenRoleModal(adminUser)}
                            disabled={!isCurrentSuperAdmin && isTargetSuper}
                            leftIcon={<Key className="w-3.5 h-3.5" />}
                          >
                            Roles
                          </Button>

                          <Button
                            variant={adminUser.is_active ? 'ghost' : 'secondary'}
                            size="sm"
                            onClick={() => handleToggleStatus(adminUser)}
                            disabled={isSelf || (!isCurrentSuperAdmin && isTargetSuper)}
                            className={
                              adminUser.is_active
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300'
                            }
                            leftIcon={
                              adminUser.is_active ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {adminUser.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <span className="font-semibold">{currentPage}</span> of{' '}
              <span className="font-semibold">{totalPages}</span> ({totalUsers} total personnel)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={`Assign Judicial Roles: ${selectedUser?.name}`}
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Select the administrative access tiers granted to <strong className="text-slate-800">{selectedUser?.email}</strong>.
            Permissions are inherited strictly from active role assignments.
          </p>

          {/* Role Selection Checkboxes */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {[
              {
                id: 'super_admin' as RoleName,
                name: 'Super Administrator',
                desc: 'Full judicial back-office access. Can manage administrators, assign all roles, configure system settings, and inspect audit logs.',
                requiresSuper: true,
              },
              {
                id: 'admin' as RoleName,
                name: 'Chamber Administrator',
                desc: 'Daily chamber and legal portfolio management. Can manage CMS, practice areas, publications, courtroom cases, and client inquiries.',
                requiresSuper: false,
              },
              {
                id: 'content_manager' as RoleName,
                name: 'Content Manager',
                desc: 'Content drafting and CMS management. Can manage static pages, navigation menus, homepage sections, media assets, and view inquiries.',
                requiresSuper: false,
              },
              {
                id: 'editor' as RoleName,
                name: 'Reviewer / Legal Editor',
                desc: 'Draft and review courtroom cases, legal research, judgments, and publications. Cannot modify administrative settings or user accounts.',
                requiresSuper: false,
              },
              {
                id: 'media_manager' as RoleName,
                name: 'Media & Gallery Manager',
                desc: 'Dedicated media officer. Can upload media assets, manage photo galleries, press coverage, appearances, and videos.',
                requiresSuper: false,
              },
            ].map((roleOption) => {
              const isChecked = selectedRoles.includes(roleOption.id);
              const isDisabled =
                (roleOption.requiresSuper && !isCurrentSuperAdmin) ||
                (selectedUser?.id === currentUser?.id && roleOption.id === 'super_admin');

              return (
                <div
                  key={roleOption.id}
                  onClick={() => !isDisabled && handleToggleRole(roleOption.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                      : isChecked
                      ? 'border-amber-500/50 bg-amber-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => handleToggleRole(roleOption.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{roleOption.name}</span>
                        {renderRoleBadge(roleOption.id)}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{roleOption.desc}</p>
                      {roleOption.requiresSuper && !isCurrentSuperAdmin && (
                        <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Requires Super Admin authority
                        </p>
                      )}
                      {selectedUser?.id === currentUser?.id && roleOption.id === 'super_admin' && (
                        <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Anti-lockout: cannot revoke your own Super Admin role
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)} disabled={isSavingRoles}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveRoles}
              disabled={isSavingRoles || selectedRoles.length === 0}
              rightIcon={
                isSavingRoles ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )
              }
            >
              {isSavingRoles ? 'Applying Permissions...' : 'Save Role Assignment'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <AdminConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </div>
  );
};
