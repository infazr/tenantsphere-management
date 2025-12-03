import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  Eye,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TenantForm } from '@/components/tenants/TenantForm';
import { Tenant, GetTenantsParams } from '@/types/api';
import apiService from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [deactivatingTenant, setDeactivatingTenant] = useState<Tenant | null>(null);

  const fetchTenants = useCallback(async (params?: GetTenantsParams) => {
    setIsLoading(true);
    try {
      const response = await apiService.getTenants({
        page: params?.page || currentPage,
        pageSize: 10,
        search: params?.search || searchQuery,
      });
      
      if (response.result) {
        setTenants(response.result.items || []);
        setTotalPages(response.result.totalPages || 1);
      }
    } catch {
      toast.error('Failed to fetch tenants');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTenants({ page: 1, search: searchQuery });
  };

  const handleCreateNew = () => {
    setEditingTenant(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    try {
      await apiService.deleteTenant(deletingTenant.id);
      toast.success('Tenant deleted successfully');
      fetchTenants();
    } catch {
      toast.error('Failed to delete tenant');
    } finally {
      setDeletingTenant(null);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingTenant) return;
    try {
      await apiService.deactivateTenant(deactivatingTenant.id);
      toast.success('Tenant deactivated successfully');
      fetchTenants();
    } catch {
      toast.error('Failed to deactivate tenant');
    } finally {
      setDeactivatingTenant(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingTenant(null);
    fetchTenants();
  };

  const moduleColors: Record<string, string> = {
    employee: 'bg-primary/10 text-primary',
    project: 'bg-accent/10 text-accent',
    leave: 'bg-success/10 text-success',
    timesheet: 'bg-warning/10 text-warning',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground">Manage your organization tenants</p>
        </div>
        <Button variant="gradient" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Search and filters */}
      <div className="glass-card rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {/* Tenants list */}
      <div className="glass-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tenants found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first tenant</p>
            <Button variant="gradient" onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Tenant</th>
                    <th className="text-left p-4 font-semibold text-foreground">Email</th>
                    <th className="text-left p-4 font-semibold text-foreground">Modules</th>
                    <th className="text-left p-4 font-semibold text-foreground">Status</th>
                    <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-sm">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{tenant.name}</p>
                            {tenant.remarks && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {tenant.remarks}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{tenant.email}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {tenant.modules?.map((module) => (
                            <span
                              key={module}
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                                moduleColors[module] || 'bg-muted text-muted-foreground'
                              )}
                            >
                              {module}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                            tenant.isActivated
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              tenant.isActivated ? 'bg-success' : 'bg-destructive'
                            )}
                          />
                          {tenant.isActivated ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {tenant.isActivated && (
                              <DropdownMenuItem onClick={() => setDeactivatingTenant(tenant)}>
                                <Power className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeletingTenant(tenant)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Create New Tenant'}</DialogTitle>
          </DialogHeader>
          <TenantForm tenant={editingTenant} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTenant} onOpenChange={() => setDeletingTenant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTenant?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={!!deactivatingTenant} onOpenChange={() => setDeactivatingTenant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{deactivatingTenant?.name}"? Users will no longer be able to access this tenant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
