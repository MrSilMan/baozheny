import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, DollarSign, TrendingUp } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin/orders");

  const [totalOrders, totalItems, totalRevenue, activeUsers, ordersByStatus] = await Promise.all([
    prisma.procurementOrder.count(),
    prisma.warehouseItem.count(),
    prisma.walletTransaction.aggregate({
      where: { type: "TOP_UP" },
      _sum: { amountUSD: true },
    }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.procurementOrder.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Items in Warehouse",
      value: totalItems,
      icon: Warehouse,
      color: "text-blue-600",
    },
    {
      title: "Total Top-ups",
      value: `$${Number(totalRevenue._sum.amountUSD ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Buyers",
      value: activeUsers,
      icon: TrendingUp,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders by status */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="text-sm font-medium">{s.status.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.max(8, (s._count.id / totalOrders) * 200)}px` }} />
                  <span className="text-sm text-muted-foreground w-8 text-right">{s._count.id}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
