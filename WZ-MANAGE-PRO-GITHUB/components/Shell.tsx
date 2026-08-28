"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const menu = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customer" },
  { href: "/booking", label: "Booking" },
  { href: "/queue", label: "Queue" },
  { href: "/pos", label: "POS / Kasir" },
  { href: "/inventory", label: "Inventory" },
  { href: "/finance", label: "Finance" },
  { href: "/commission", label: "Commission & Payroll" },
  { href: "/reports", label: "Reports" },
];

export default function Shell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f5f7fb",
        color: "#111827",
      }}
    >
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          background: "#111827",
          color: "white",
          padding: "20px",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <h2 style={{ marginBottom: "25px" }}>
          WZ MANAGE PRO
        </h2>

        <nav>
          {menu.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "11px 12px",
                  marginBottom: "6px",
                  borderRadius: "9px",
                  textDecoration: "none",
                  color: "white",
                  background: active
                    ? "#374151"
                    : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main
        style={{
          marginLeft: "240px",
          width: "calc(100% - 240px)",
          minHeight: "100vh",
          padding: "25px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
