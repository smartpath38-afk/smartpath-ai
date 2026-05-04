// src/app/[locale]/dashboard/layout.tsx
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RendersCounter from "@/components/dashboard/RendersCounter";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Mobile header */}
      <DashboardHeader />

      {/* Main content — offset by sidebar on desktop */}
      <main className="lg:ml-[220px] min-h-screen">
        {/* Renders counter — shows on desktop at top of content area */}
        <div className="hidden lg:block">
          <RendersCounter />
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
