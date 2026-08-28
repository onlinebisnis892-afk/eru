"use client";

import Link from "next/link";

export default function CommissionPage() {
  return (
    <main style={{ padding: "24px" }}>
      <h1>Commission & Payroll</h1>

      <p style={{ marginTop: "8px" }}>
        Kelola commission dan payroll barber di sini.
      </p>

      <div style={{ marginTop: "24px" }}>
        <Link href="/dashboard">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </main>
  );
}
