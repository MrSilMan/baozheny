import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center p-8">
      <div>
        <p className="font-display text-8xl font-bold text-gold-500">404</p>
        <h2 className="font-display text-2xl font-bold mt-2">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="default" asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}
