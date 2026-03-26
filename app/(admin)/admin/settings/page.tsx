import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ServiceType } from "@prisma/client";

const SERVICE_LABELS: Record<ServiceType, string> = {
  PROCUREMENT: "Procurement",
  QUALITY_INSPECTION: "Quality Inspection",
  WAREHOUSING: "Warehousing",
  CONSOLIDATION: "Consolidation",
  LABELING: "Labeling",
  REPACKAGING: "Repackaging",
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin/orders");

  const [feeConfigs, carriers] = await Promise.all([
    prisma.serviceFeeConfig.findMany({ orderBy: { serviceType: "asc" } }),
    prisma.carrier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      {/* Service fees */}
      <Card>
        <CardHeader>
          <CardTitle>Service Fee Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Base Fee (USD)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    {SERVICE_LABELS[config.serviceType]}
                  </TableCell>
                  <TableCell className="font-mono">
                    ${Number(config.baseFeeUSD).toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.active ? "default" : "secondary"}>
                      {config.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {config.description ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Carriers */}
      <Card>
        <CardHeader>
          <CardTitle>Carriers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carriers.map((carrier) => (
                <TableRow key={carrier.id}>
                  <TableCell className="font-medium">{carrier.name}</TableCell>
                  <TableCell className="font-mono text-sm">{carrier.code}</TableCell>
                  <TableCell>
                    <Badge variant={carrier.active ? "default" : "secondary"}>
                      {carrier.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {carrier.trackingUrlTemplate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
