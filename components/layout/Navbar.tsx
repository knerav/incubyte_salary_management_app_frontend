"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CircleUser } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { href: "/employees", label: "Employees" },
  { href: "/insights", label: "Insights" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium px-3 py-1.5 rounded-md transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { token, signOut } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6">

        {/* Left: brand */}
        <Link href="/">
          <Image src="/hrpulse_logo.png" alt="HR Pulse" height={32} width={120} className="h-40 w-auto object-contain" unoptimized />
        </Link>

        {/* Center: nav links — desktop only */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        {/* Right: user dropdown */}
        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="User menu">
                <CircleUser className="size-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">

              {/* Mobile-only nav links */}
              <div className="md:hidden">
                {NAV_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>

              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                Sign out
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-9" />
        )}

      </div>
    </nav>
  );
}
