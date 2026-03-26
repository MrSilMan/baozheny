import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { InspectionResult } from "@prisma/client";

const resultConfig: Record<
  InspectionResult,
  { label: string; icon: React.ElementType; color: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Pending", icon: AlertCircle, color: "text-amber-600", variant: "secondary" },
  PASSED: { label: "Passed", icon: CheckCircle, color: "text-green-600", variant: "default" },
  FAILED: { label: "Failed", icon: XCircle, color: "text-destructive", variant: "destructive" },
  PARTIAL: { label: "Partial", icon: AlertCircle, color: "text-amber-600", variant: "outline" },
};

export default async function InspectionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reports = await prisma.inspectionReport.findMany({
    where: {
      warehouseItem: { buyerId: session.user.id },
    },
    include: {
      warehouseItem: {
        include: {
          order: { select: { id: true, productName: true } },
        },
      },
      inspector: { select: { name: true } },
      checkItems: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Inspection Reports</h1>

      {reports.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No inspection reports yet</h2>
          <p className="text-muted-foreground">
            Reports will appear here once your items have been inspected at our warehouse.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const config = resultConfig[report.result];
            const ResultIcon = config.icon;
            const passedCount = report.checkItems.filter((c) => c.passed).length;
            const totalCount = report.checkItems.length;

            return (
              <Card key={report.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/buyer/orders/${report.warehouseItem.order.id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {report.warehouseItem.order.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Inspected by {report.inspector.name ?? "BaoZhen team"} ·{" "}
                        {format(report.createdAt, "MMM d, yyyy")}
                      </p>
                      {totalCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {passedCount}/{totalCount} checks passed
                        </p>
                      )}
                      {report.overallNotes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {report.overallNotes}
                        </p>
                      )}
                    </div>
                    <Badge variant={config.variant} className="shrink-0">
                      <ResultIcon className="h-3.5 w-3.5 mr-1" />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Check items */}
                  {report.checkItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-1">
                      {report.checkItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-xs">
                          {item.passed ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                          )}
                          <span className={item.passed ? "" : "text-destructive"}>
                            {item.checkName}
                          </span>
                          {item.notes && (
                            <span className="text-muted-foreground">— {item.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
