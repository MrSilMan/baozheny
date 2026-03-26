import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  platform: [
    { label: "Products", href: "/products" },
    { label: "Suppliers", href: "/suppliers" },
    { label: "Categories", href: "/categories" },
    { label: "Pricing", href: "/pricing" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Shipping Guide", href: "/shipping" },
    { label: "Import Guide", href: "/import-guide" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white" aria-label="Site footer">
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl mb-4">
              <span className="text-gold-500">宝针</span>
              <span className="text-white">BaoZhen</span>
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed">
              Buy from China, Built for the World. Your trusted gateway to premium Chinese suppliers.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-navy-300 mb-4">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-400 hover:text-gold-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-navy-800" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-navy-400">
          <p>&copy; {new Date().getFullYear()} BaoZhen. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>🇨🇳 Sourced from China</span>
            <span>·</span>
            <span>🌍 Delivered Worldwide</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
