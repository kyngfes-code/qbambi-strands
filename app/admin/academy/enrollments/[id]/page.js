"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import EnrollmentHeader from "@/components/academy/enrollments/enrollment/EnrollmentHeader";
import EnrollmentTimeline from "@/components/academy/enrollments/enrollment/EnrollmentTimeline";

import StudentInformationCard from "@/components/academy/enrollments/enrollment/StudentInformationCard";
import AddressCard from "@/components/academy/enrollments/enrollment/AddressCard";
import EmergencyContactCard from "@/components/academy/enrollments/enrollment/EmergencyContactCard";
import TrainingInformationCard from "@/components/academy/enrollments/enrollment/TrainingInformationCard";
import PaymentInformationCard from "@/components/academy/enrollments/enrollment/PaymentInformationCard";
import AdditionalInformationCard from "@/components/academy/enrollments/enrollment/AdditionalInformationCard";
import EnrollmentStatusCard from "@/components/academy/enrollments/enrollment/EnrollmentStatusCard";
import PaymentHistoryCard from "@/components/academy/enrollments/enrollment/PaymentHistoryCard";
import EnrollmentNotesCard from "@/components/academy/enrollments/enrollment/EnrollmentNotesCard";
import EnrollmentActions from "@/components/academy/enrollments/enrollment/EnrollmentActions";

import ApproveEnrollmentDialog from "@/components/academy/enrollments/enrollment/ApproveEnrollmentDialog";
import RejectEnrollmentDialog from "@/components/academy/enrollments/enrollment/RejectEnrollmentDialog";
import AssignPricingDialog from "@/components/academy/enrollments/enrollment/AssignPricingDialog";
import RecordPaymentDialog from "@/components/academy/enrollments/enrollment/RecordPaymentDialog";
import AddAdminNoteDialog from "@/components/academy/enrollments/enrollment/AddAdminNoteDialog";
import BackButton from "../../BackButton";

export default function EnrollmentDetailsPage() {
  const params = useParams();

  //------------------------------------------------------
  // State
  //------------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [enrollment, setEnrollment] = useState(null);

  const [pricingOptions, setPricingOptions] = useState([]);

  //------------------------------------------------------
  // Dialogs
  //------------------------------------------------------

  const [approveOpen, setApproveOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);

  const [pricingOpen, setPricingOpen] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);

  const [noteOpen, setNoteOpen] = useState(false);

  //------------------------------------------------------
  // Load Enrollment
  //------------------------------------------------------

  async function loadEnrollment() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/academy/enrollments/${params.id}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setEnrollment(data.enrollment);

      setPricingOptions(data.pricingOptions || []);
    } catch (err) {
      console.error(err);

      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  //------------------------------------------------------

  useEffect(() => {
    if (params?.id) {
      loadEnrollment();
    }
  }, [params?.id]);

  //------------------------------------------------------
  // Actions
  //------------------------------------------------------

  async function performAction(action, payload = {}) {
    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/academy/enrollments/${params.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          action,
          ...payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setApproveOpen(false);

      setRejectOpen(false);

      setPricingOpen(false);

      setPaymentOpen(false);

      setNoteOpen(false);

      await loadEnrollment();
    } catch (err) {
      console.error(err);

      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  //------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        Loading enrollment...
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex h-96 items-center justify-center">
        Enrollment not found.
      </div>
    );
  }

  //------------------------------------------------------

  return (
    <>
      <div className="space-y-8">
        <BackButton />
        <EnrollmentHeader enrollment={enrollment} />

        <EnrollmentActions
          enrollment={enrollment}
          onApprove={() => setApproveOpen(true)}
          onReject={() => setRejectOpen(true)}
          onAssignPricing={() => setPricingOpen(true)}
          onRecordPayment={() => setPaymentOpen(true)}
          onAddNote={() => setNoteOpen(true)}
        />

        <div className="grid gap-8 xl:grid-cols-3">
          {/* LEFT */}

          <div className="space-y-8 xl:col-span-2">
            <StudentInformationCard enrollment={enrollment} />

            <AddressCard enrollment={enrollment} />

            <EmergencyContactCard enrollment={enrollment} />

            <TrainingInformationCard enrollment={enrollment} />

            <AdditionalInformationCard enrollment={enrollment} />

            <PaymentHistoryCard payments={enrollment.payment_history || []} />

            <EnrollmentNotesCard notes={enrollment.admin_notes || []} />

            <EnrollmentTimeline enrollment={enrollment} />
          </div>

          {/* RIGHT */}

          <div className="space-y-8">
            <EnrollmentStatusCard enrollment={enrollment} />

            <PaymentInformationCard enrollment={enrollment} />
          </div>
        </div>
      </div>

      {/* Dialogs */}

      <ApproveEnrollmentDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        enrollment={enrollment}
        loading={actionLoading}
        onSubmit={(payload) => performAction("approve", payload)}
      />

      <RejectEnrollmentDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        enrollment={enrollment}
        loading={actionLoading}
        onSubmit={(payload) => performAction("reject", payload)}
      />

      <AssignPricingDialog
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        enrollment={enrollment}
        pricingOptions={pricingOptions}
        loading={actionLoading}
        onSubmit={(payload) => performAction("assign_pricing", payload)}
      />

      <RecordPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        enrollment={enrollment}
        loading={actionLoading}
        onSubmit={(payload) => performAction("record_payment", payload)}
      />

      <AddAdminNoteDialog
        open={noteOpen}
        onOpenChange={setNoteOpen}
        enrollment={enrollment}
        loading={actionLoading}
        onSubmit={(payload) => performAction("add_note", payload)}
      />
    </>
  );
}
