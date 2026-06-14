import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Leaf, LayoutDashboard, History, Sparkles, Trophy, Settings, Menu, X, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/history", label: "History", icon: History },
    { href: "/recommendations", label: "Ideas", icon: Sparkles },
    { href: "/actions", label: "Progress", icon: Trophy },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-outfit font-bold text-xl text-foreground">EcoTrace</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/log">
            <Button size="sm" variant="default" className="h-9 px-3">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Log
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="font-outfit font-bold text-2xl text-foreground">EcoTrace</span>
        </div>

        <div className="px-4 pb-4">
          <Link href="/log">
            <Button className="w-full justify-start text-base h-12 shadow-sm">
              <PlusCircle className="w-5 h-5 mr-3" />
              Log Activity
            </Button>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer
                  ${active 
                    ? 'bg-secondary text-secondary-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}>
                  <item.icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link href="/settings">
            <div className={`
              flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer
              ${location === '/settings' 
                ? 'bg-secondary text-secondary-foreground font-medium' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
            `}>
              <Settings className="w-5 h-5" />
              Settings
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        {children}
      </main>
    </div>
  );
}
