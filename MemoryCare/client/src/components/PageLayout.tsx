import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { EmergencyButton } from "@/components/EmergencyButton";
import { MedicineReminders } from "@/components/MedicineReminders";
import { DailyTasksSidebar } from "@/components/DailyTasksSidebar";
import { DailyRoutineSidebar } from "@/components/DailyRoutineSidebar";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-4 content-overlay">
            {children}
          </div>
          
          {/* Right Sidebar - Always visible */}
          <div className="xl:col-span-2 space-y-6 content-overlay">
            <MedicineReminders />
            <DailyRoutineSidebar />
          </div>
        </div>
      </div>
      <EmergencyButton />
    </div>
  );
}