'use client';

import { AppHeader } from "@/components/app-header";
import { AedesGuardLogo } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BadgeCheck, LayoutDashboard, ShieldPlus, ClipboardPlus, BarChart, User as UserIcon } from "lucide-react";
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";

const allNavItems = {
  public: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Public Dashboard" },
  ],
  user: [
    { href: "/user-dashboard", icon: UserIcon, label: "My Dashboard" },
    { href: "/report", icon: ShieldPlus, label: "Report Site" },
    { href: "/verify", icon: BadgeCheck, label: "Verify Sites" },
  ],
  officer: [
    { href: "/officer-dashboard", icon: LayoutDashboard, label: "Officer Dashboard" },
    { href: "/report", icon: ShieldPlus, label: "Report Site" },
    { href: "/verify", icon: BadgeCheck, label: "Verify Sites" },
    { href: "/health-report", icon: ClipboardPlus, label: "Report Cases" },
    { href: "/admin-console", icon: BarChart, label: "Admin Console" },
  ]
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const role = useUserRole();

  const navItems = useMemo(() => {
    if (role === 'officer') return allNavItems.officer;
    if (role === 'user') return allNavItems.user;
    return allNavItems.public;
  }, [role]);

  const getPageTitle = () => {
    const allItems = [...allNavItems.officer, ...allNavItems.user, ...allNavItems.public];
    const currentItem = allItems.find(item => pathname.startsWith(item.href));
    
    if (pathname.includes('-dashboard') || pathname === '/dashboard') {
      const roleTitle = role === 'officer' ? 'Officer' : role === 'user' ? 'User' : 'Public';
      return `${roleTitle} Dashboard`;
    }
    return currentItem ? currentItem.label : "AedesGuard";
  };
  
  return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar className="bg-card" collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center gap-2.5 px-2">
                <AedesGuardLogo className="h-8 w-8 text-primary" />
                <span className={cn(
                    "text-lg font-semibold", 
                    "group-data-[collapsible=icon]:hidden duration-300 transition-opacity"
                )}>
                  AedesGuard
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {role === 'loading' ? (
                  <div className="p-2 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                      >
                        <a href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1">
              <AppHeader title={getPageTitle()} />
              <div className="p-4 md:p-6">
                  {children}
              </div>
          </main>
        </div>
      </SidebarProvider>
  );
}
