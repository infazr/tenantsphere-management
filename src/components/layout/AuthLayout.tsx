import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sidebar via-primary/90 to-sidebar">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary/10 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-glow">
            <span className="text-primary-foreground font-bold text-3xl">E</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4 text-center">
            Employee Management
          </h1>
          <p className="text-lg text-primary-foreground/70 text-center max-w-md">
            A comprehensive platform to manage your organization's workforce efficiently
          </p>

          {/* Feature highlights */}
          <div className="mt-16 grid gap-6 w-full max-w-sm">
            {[
              { title: 'Multi-tenant', desc: 'Manage multiple organizations' },
              { title: 'Role-based Access', desc: 'Secure permission system' },
              { title: 'Real-time', desc: 'Instant updates across all devices' },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="flex items-center gap-4 p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">{feature.title}</h3>
                  <p className="text-sm text-primary-foreground/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
