import AppointmentAdminNotes from "./AppointmentAdminNotes";
import AppointmentCancellation from "./AppointmentCancellation";
import AppointmentFinancialHistory from "./AppointmentFinancialHistory";
import AppointmentPricing from "./AppointmentPricing";
import AppointmentSummary from "./AppointmentSummary";

export default function AppointmentDetailsContent({
  appointment,
  variant = "details",
}) {
  if (!appointment) return null;

  const isAdmin = variant === "admin" || variant === "completion";

  const showStatus = true;

  const showPricing = true;

  const showFinancialHistory =
    variant === "details" || variant === "admin" || variant === "completion";

  const showCancellation = variant !== "completion";

  const showAdminNotes = variant === "admin";

  return (
    <div className="space-y-6">
      <AppointmentSummary
        appointment={appointment}
        isAdmin={isAdmin}
        showStatus={showStatus}
      />

      {showPricing && <AppointmentPricing appointment={appointment} />}

      {showFinancialHistory && (
        <AppointmentFinancialHistory
          appointment={appointment}
          variant={variant}
        />
      )}

      {showCancellation && (
        <AppointmentCancellation appointment={appointment} isAdmin={isAdmin} />
      )}

      {showAdminNotes && (
        <AppointmentAdminNotes appointment={appointment} isAdmin={isAdmin} />
      )}
    </div>
  );
}
