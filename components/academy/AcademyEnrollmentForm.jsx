"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import academyEnrollmentSchema from "@/lib/validations/academyEnrollmentSchema";
import useAcademyPricing from "@/hooks/useAcademyPricing";
import useWizard from "@/hooks/useWizard";

import AcademyEnrollmentWizard from "./wizard/AcademyEnrollmentWizard";
import getAcademyWizardSteps from "./config/academyWizardSteps";

export default function AcademyEnrollmentForm({
  courses = [],
  isExistingStudent = false,
  student = null,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ==========================================================
  // PRICING
  // ==========================================================

  const pricing = useAcademyPricing(courses);

  // ==========================================================
  // ACTIVE WIZARD STEPS
  // ==========================================================

  const activeSteps = useMemo(() => {
    return getAcademyWizardSteps({
      isExistingStudent,
    });
  }, [isExistingStudent]);

  // ==========================================================
  // FORM
  // ==========================================================

  const methods = useForm({
    resolver: zodResolver(academyEnrollmentSchema),

    defaultValues: {
      // PERSONAL INFORMATION

      first_name: student?.first_name ?? "",
      last_name: student?.last_name ?? "",
      other_name: student?.other_name ?? "",
      gender: student?.gender ?? "",
      date_of_birth: student?.date_of_birth ?? "",

      email: student?.email ?? "",
      phone: student?.phone ?? "",
      whatsapp: student?.whatsapp ?? "",

      // ADDRESS

      country: student?.country ?? "",
      state: student?.state ?? "",
      city: student?.city ?? "",
      street_address: student?.street_address ?? "",
      postal_code: student?.postal_code ?? "",

      // TRAINING

      preferred_start_date: "",
      learning_mode: "",
      payment_plan_id: "",

      // EMERGENCY CONTACT

      emergency_contact_name: student?.emergency_contact_name ?? "",

      emergency_contact_phone: student?.emergency_contact_phone ?? "",

      emergency_contact_relationship:
        student?.emergency_contact_relationship ?? "",

      // ADDITIONAL INFORMATION

      occupation: student?.occupation ?? "",
      education_level: student?.education_level ?? "",
      referral_source: student?.referral_source ?? "",
      notes: student?.notes ?? "",

      // TERMS
      terms: isExistingStudent ? true : false,

      // SYSTEM

      total_course_fee: 0,
      courses: [],
    },
  });

  // ==========================================================
  // WIZARD
  // ==========================================================

  const wizard = useWizard({
    steps: activeSteps,
    methods,
  });

  // ==========================================================
  // REACT HOOK FORM
  // ==========================================================

  const {
    handleSubmit,
    reset,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = methods;

  // ==========================================================
  // DEBUG VALIDATION
  // ==========================================================

  useEffect(() => {
    if (Object.keys(errors).length) {
      console.log("[ACADEMY ENROLLMENT] Validation Errors", errors);
    }
  }, [errors]);

  // ==========================================================
  // SYNC PRICING WITH FORM
  // ==========================================================

  useEffect(() => {
    setValue("learning_mode", pricing.learningMode);

    setValue("total_course_fee", pricing.totalFee);

    setValue("courses", pricing.enrollmentCourses);
  }, [
    pricing.learningMode,
    pricing.totalFee,
    pricing.enrollmentCourses,
    setValue,
  ]);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function onSubmit(values) {
    clearErrors("root");

    // --------------------------------------------------------
    // VALIDATE COURSE SELECTION
    // --------------------------------------------------------

    if (!pricing.enrollmentCourses.length) {
      setError("root", {
        type: "manual",
        message: "Please select at least one course.",
      });

      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...values,

        is_existing_student: isExistingStudent,

        learning_mode: pricing.learningMode,

        payment_plan_id: values.payment_plan_id,

        total_course_fee: pricing.totalFee,

        courses: pricing.enrollmentCourses,
      };

      const res = await fetch("/api/academy/enroll", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to submit enrollment.");
      }

      // ------------------------------------------------------
      // RESET
      // ------------------------------------------------------

      reset();

      pricing.resetPricing();

      wizard.resetWizard();

      router.push("/academy/enrollment-success");
    } catch (error) {
      console.error("[ACADEMY ENROLLMENT] Submit failed", error);

      setError("root", {
        type: "manual",
        message: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-5xl"
      >
        {/* ================================================== */}
        {/* EXISTING STUDENT NOTICE */}
        {/* ================================================== */}

        {isExistingStudent && (
          <div className="mb-6 rounded-2xl border border-[#C6A667]/30 bg-[#C6A667]/10 p-5">
            <p className="font-semibold text-neutral-900">Welcome back!</p>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Your student information is already on file. You only need to
              select your new courses, choose your training preferences, select
              a payment plan, and review your enrollment.
            </p>
          </div>
        )}

        {/* ================================================== */}
        {/* WIZARD */}
        {/* ================================================== */}

        <AcademyEnrollmentWizard
          steps={activeSteps}
          wizard={wizard}
          pricing={pricing}
          courses={courses}
          loading={loading}
          isExistingStudent={isExistingStudent}
          student={student}
        />

        {/* ================================================== */}
        {/* ROOT ERROR */}
        {/* ================================================== */}

        {errors.root && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
