import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tenant, Module, CreateTenantRequest, UpdateTenantRequest } from '@/types/api';
import apiService from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
  modules: z.array(z.enum(['employee', 'project', 'leave', 'timesheet'])).min(1, 'Select at least one module'),
  isActivated: z.boolean(),
});

interface TenantFormProps {
  tenant?: Tenant | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const availableModules: { value: Module; label: string; description: string }[] = [
  { value: 'employee', label: 'Employee', description: 'Manage employee records' },
  { value: 'project', label: 'Project', description: 'Track projects and tasks' },
  { value: 'leave', label: 'Leave', description: 'Leave management system' },
  { value: 'timesheet', label: 'Timesheet', description: 'Time tracking & reporting' },
];

export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    email: tenant?.email || '',
    remarks: tenant?.remarks || '',
    modules: tenant?.modules || [] as Module[],
    isActivated: tenant?.isActivated ?? true,
  });
  const [displayPicture, setDisplayPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleModuleToggle = (module: Module) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
    setErrors((prev) => ({ ...prev, modules: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('File size must be less than 1MB');
        return;
      }
      setDisplayPicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setDisplayPicture(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = tenantSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (tenant) {
        const updateData: UpdateTenantRequest = {
          Id: tenant.id,
          Name: formData.name,
          Remarks: formData.remarks,
          Modules: formData.modules,
          IsActivated: formData.isActivated,
        };
        if (displayPicture) {
          updateData.DisplayPictureFile = displayPicture;
        }
        await apiService.updateTenant(updateData);
        toast.success('Tenant updated successfully');
      } else {
        const createData: CreateTenantRequest = {
          Name: formData.name,
          Email: formData.email,
          Remarks: formData.remarks,
          Modules: formData.modules,
          IsActivated: formData.isActivated,
        };
        if (displayPicture) {
          createData.DisplayPictureFile = displayPicture;
        }
        await apiService.createTenant(createData);
        toast.success('Tenant created successfully');
      }
      onSuccess();
    } catch {
      toast.error(tenant ? 'Failed to update tenant' : 'Failed to create tenant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Picture */}
      <div className="space-y-2">
        <Label>Display Picture</Label>
        <div className="flex items-center gap-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <p className="text-sm text-muted-foreground">Max size: 1MB</p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter tenant name"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          disabled={!!tenant}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Add any special remarks..."
          rows={3}
        />
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <Label>Modules *</Label>
        <div className="grid grid-cols-2 gap-3">
          {availableModules.map((module) => (
            <button
              key={module.value}
              type="button"
              onClick={() => handleModuleToggle(module.value)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all duration-200',
                formData.modules.includes(module.value)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <p className="font-medium text-foreground">{module.label}</p>
              <p className="text-xs text-muted-foreground">{module.description}</p>
            </button>
          ))}
        </div>
        {errors.modules && <p className="text-sm text-destructive">{errors.modules}</p>}
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div>
          <Label htmlFor="isActivated">Active Status</Label>
          <p className="text-sm text-muted-foreground">Enable or disable tenant access</p>
        </div>
        <Switch
          id="isActivated"
          checked={formData.isActivated}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActivated: checked }))}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="gradient" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {tenant ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            tenant ? 'Update Tenant' : 'Create Tenant'
          )}
        </Button>
      </div>
    </form>
  );
}
