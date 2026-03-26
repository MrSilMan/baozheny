"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Warehouse,
  ClipboardCheck,
  Boxes,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const navItems = [
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/admin/inspection", label: "Inspection", icon: ClipboardCheck },
  { href: "/admin/consolidation", label: "Consolidation", icon: Boxes },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="flex-1 overflow-auto py-4 px-3">
      <ul className="space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
