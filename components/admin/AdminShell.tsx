"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen  text-[#1c1c1a]">

      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">

        <AdminHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <main>
          {children}
        </main>

      </div>
    </div>
  );
}