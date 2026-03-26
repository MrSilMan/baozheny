import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { TransactionType } from "@prisma/client";

const txIcons: Record<TransactionType, React.ElementType> = {
  TOP_UP: ArrowDownLeft,
  PROCUREMENT: ArrowUpRight,
  FEE: ArrowUpRight,
  REFUND: ArrowDownLeft,
  SHIPPING_ESTIMATE: ArrowUpRight,
  ADJUSTMENT: RefreshCw,
};

const txColor: Record<TransactionType, string> = {
  TOP_UP: "text-green-600",
  PROCUREMENT: "text-red-600",
  FEE: "text-red-600",
  REFUND: "text-green-600",
  SHIPPING_ESTIMATE: "text-amber-600",
  ADJUSTMENT: "text-muted-foreground",
};

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    }),
    prisma.walletTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const balance = Number(user?.balance ?? 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Wallet</h1>

      {/* Balance card */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium">Available Balance</p>
              <p className="text-4xl font-display font-bold mt-1">${balance.toFixed(2)}</p>
              <p className="text-primary-foreground/70 text-xs mt-2">USD</p>
            </div>
            <Wallet className="h-12 w-12 text-primary-foreground/30" />
          </div>
          <div className="mt-6">
            <Button variant="secondary" asChild>
              <Link href="/buyer/wallet/top-up">
                <Plus className="h-4 w-4 mr-2" /> Top Up
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Top up to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const Icon = txIcons[tx.type];
                  const isCredit = tx.type === "TOP_UP" || tx.type === "REFUND";
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${txColor[tx.type]}`} />
                          <Badge variant="outline" className="text-xs">
                            {tx.type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {tx.note ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(tx.createdAt, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono text-sm font-medium ${
                          isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}${Math.abs(Number(tx.amountUSD)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        ${Number(tx.balanceAfter).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
