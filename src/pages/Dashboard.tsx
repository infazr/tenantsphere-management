import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, TrendingUp, Activity, Settings } from 'lucide-react';

const stats = [
  {
    label: 'Total Tenants',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Building2,
    color: 'from-primary to-primary/70',
  },
  {
    label: 'Active Users',
    value: '1,234',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'from-accent to-accent/70',
  },
];

export default function Dashboard() {
  const { user, isSuperAdmin } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-primary-foreground">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-primary-foreground/80 max-w-xl">
            {isSuperAdmin
              ? 'Manage all tenants and monitor system-wide performance from your super admin dashboard.'
              : 'Here\'s an overview of your organization\'s activity and performance.'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="glass-card rounded-xl p-6 hover-lift group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                {stat.change}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { action: 'New tenant created', entity: 'Acme Corp', time: '2 hours ago', type: 'create' },
              { action: 'User joined', entity: 'john@example.com', time: '4 hours ago', type: 'user' },
              { action: 'Tenant updated', entity: 'Tech Solutions', time: '6 hours ago', type: 'update' },
              { action: 'Module activated', entity: 'Timesheet - StartupXYZ', time: '1 day ago', type: 'module' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.entity}</p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          
          <div className="space-y-3">
            {[
              { label: 'Create Tenant', icon: Building2, href: '/dashboard/tenants/new' },
              { label: 'Add User', icon: Users, href: '/dashboard/users/new' },
              { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
