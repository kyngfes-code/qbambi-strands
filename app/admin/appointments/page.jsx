"use client";

import AdminAppointmentModals from "@/components/admin/appointments/AdminAppointmentModals";
import AdminAppointmentsContent from "@/components/admin/appointments/AdminAppointmentsContent";
import AdminAppointmentsHeader from "@/components/admin/appointments/AdminAppointmentsHeader";
import ErrorBanner from "@/components/ErrorBanner";
import PageSpinner from "@/components/PageSpinner";
import useAdminAppointmentsDashboard from "@/hooks/useAdminAppointmentsDashboard";
import useAppointmentActions from "@/hooks/useAppointmentActions";
import useAppointmentModals from "@/hooks/useAppointmentModals";
import useAppointmentUIActions from "@/hooks/useAppointmentUIActions";

export default function AdminAppointmentsPage() {
  const dashboard = useAdminAppointmentsDashboard();

  const modals = useAppointmentModals();

  const mutations = useAppointmentActions(dashboard.refreshDashboard);

  const uiActions = useAppointmentUIActions(modals);

  const actions = {
    ...mutations,
    ...uiActions,
  };

  if (dashboard.loading) {
    return <PageSpinner text="Loading appointment dashboard..." />;
  }

  return (
    <div className="min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminAppointmentsHeader onRefresh={dashboard.refreshDashboard} />

        <ErrorBanner message={dashboard.error} />

        <AdminAppointmentsContent data={dashboard} actions={actions} />
      </div>

      <AdminAppointmentModals {...modals} actions={actions} />
    </div>
  );
}
