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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BadgeCheck, LayoutDashboard, ShieldPlus } from "lucide-react";
import { usePathname } from 'next/navigation';
import type { ReactNode } from "react";
import { FirebaseClientProvider } from "@/firebase/client-provider";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/report", icon: ShieldPlus, label: "Report Site" },
  { href: "/verify", icon: BadgeCheck, label: "Verify Sites" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const currentItem = navItems.find(item => pathname.startsWith(item.href));
    return currentItem ? currentItem.label : "Dashboard";
  };
  
  return (
    <FirebaseClientProvider>
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
                {navItems.map((item) => (
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
                ))}
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
    </FirebaseClientProvider>
  );
}

    