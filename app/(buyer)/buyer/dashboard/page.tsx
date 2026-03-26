import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Warehouse, ClipboardCheck, Wallet, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function BuyerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [activeOrders, warehouseItems, pendingInspections, user, recentOrders] =
    await Promise.all([
      prisma.procurementOrder.count({
        where: {
          buyerId: userId,
          status: { notIn: ["STORED", "CANCELLED"] },
        },
      }),
      prisma.warehouseItem.count({
        where: { buyerId: userId, status: "STORED" },
      }),
      prisma.procurementOrder.count({
        where: { buyerId: userId, status: "INSPECTION_PENDING" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true, name: true },
      }),
      prisma.procurementOrder.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          productName: true,
          status: true,
          createdAt: true,
          platform: true,
        },
      }),
    ]);

  const stats = [
    {
      title: "Active Orders",
      value: activeOrders,
      icon: Package,
      href: "/buyer/orders",
      color: "text-primary",
    },
    {
      title: "Items in Warehouse",
      value: warehouseItems,
      icon: Warehouse,
      href: "/buyer/warehouse",
      color: "text-blue-600",
    },
    {
      title: "Pending Inspections",
      value: pendingInspections,
      icon: ClipboardCheck,
      href: "/buyer/inspection",
      color: "text-amber-600",
    },
    {
      title: "Wallet Balance",
      value: `$${Number(user?.balance ?? 0).toFixed(2)}`,
      icon: Wallet,
      href: "/buyer/wallet",
      color: "text-green-600",
    },
  ];

  const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    SUBMITTED: "outline",
    PROCURING: "outline",
    ARRIVED_CN: "outline",
    INSPECTION_PENDING: "destructive",
    INSPECTION_DONE: "outline",
    STORED: "default",
    CANCELLED: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your orders today.
          </p>
        </div>
        <Button asChild>
          <Link href="/buyer/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/buyer/orders">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No orders yet.</p>
              <Button asChild>
                <Link href="/buyer/orders/new">Submit your first order</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/buyer/orders/${order.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{order.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      #{order.orderNumber.slice(-8)} &middot;{" "}
                      {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={(statusColors[order.status] ?? "outline") as "default" | "secondary" | "outline" | "destructive"}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
