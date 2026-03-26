"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  Truck,
  ClipboardCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buyer/orders", label: "My Orders", icon: Package },
  { href: "/buyer/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/buyer/consolidation", label: "Consolidation", icon: Boxes },
  { href: "/buyer/shipments", label: "Shipments", icon: Truck },
  { href: "/buyer/inspection", label: "Inspections", icon: ClipboardCheck },
  { href: "/buyer/wallet", label: "Wallet", icon: Wallet },
];

export function BuyerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-auto py-4 px-3">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/buyer/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
