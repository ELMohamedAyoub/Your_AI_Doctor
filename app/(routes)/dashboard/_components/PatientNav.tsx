"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Activity, MessageSquare, Pill, TrendingUp, Home, Heart } from "lucide-react";

export default function PatientNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/patient-dashboard", icon: Home },
    { name: "Health Check", href: "/patient-dashboard#monitoring", icon: Activity },
    { name: "AI Doctor", href: "/patient-dashboard#chat", icon: MessageSquare },
    { name: "Medications", href: "/patient-dashboard#medications", icon: Pill },
    { name: "Trends", href: "/patient-dashboard#trends", icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b border-green-200 dark:border-green-800 shadow-sm" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex items-center justify-between h-16" suppressHydrationWarning>
          {/* Logo */}
          <Link href="/patient-dashboard" className="flex items-center space-x-2 group" suppressHydrationWarning>
            <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors" suppressHydrationWarning>
              <Heart className="h-5 w-5 text-white" suppressHydrationWarning />
            </div>
            <span className="font-bold text-lg text-green-900 dark:text-green-100" suppressHydrationWarning>
              Your AI Doctor
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1" suppressHydrationWarning>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href.includes('#') && pathname === item.href.split('#')[0]);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900"
                  }`}
                  suppressHydrationWarning
                >
                  <Icon className="h-4 w-4" suppressHydrationWarning />
                  <span className="text-sm font-medium" suppressHydrationWarning>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3" suppressHydrationWarning>
            <div className="hidden sm:block" suppressHydrationWarning>
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-full" suppressHydrationWarning>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" suppressHydrationWarning />
                <span className="text-xs font-medium text-green-700 dark:text-green-300" suppressHydrationWarning>
                  Recovery Mode
                </span>
              </div>
            </div>
            <div suppressHydrationWarning>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-green-300"
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2 overflow-x-auto pb-3 scrollbar-hide" suppressHydrationWarning>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-green-700 dark:text-green-300"
                }`}
                suppressHydrationWarning
              >
                <Icon className="h-4 w-4" suppressHydrationWarning />
                <span className="text-xs" suppressHydrationWarning>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
