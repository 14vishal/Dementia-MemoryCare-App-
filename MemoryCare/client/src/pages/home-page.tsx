import { PatientDashboard } from "@/components/PatientDashboard";
import { CaregiverDashboard } from "@/components/CaregiverDashboard";
import { PageLayout } from "@/components/PageLayout";

export default function HomePage() {
  // For demo purposes, always show patient dashboard
  const userRole: "patient" | "caregiver" = "patient";

  return (
    <PageLayout>
      {userRole === "caregiver" ? <CaregiverDashboard /> : <PatientDashboard />}
    </PageLayout>
  );
}
