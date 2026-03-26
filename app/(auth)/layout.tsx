import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl w-fit">
            <span className="text-gold-500">宝针</span>
            <span className="text-navy-900 dark:text-white">BaoZhen</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} BaoZhen. All rights reserved.
      </footer>
    </div>
  );
}
