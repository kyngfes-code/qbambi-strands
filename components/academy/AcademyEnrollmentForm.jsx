"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import academyEnrollmentSchema from "@/lib/validations/academyEnrollmentSchema";
import useAcademyPricing from "@/hooks/useAcademyPricing";
import useWizard from "@/hooks/useWizard";
import AcademyEnrollmentWizard from "./wizard/AcademyEnrollmentWizard";
import academyWizardSteps from "./config/academyWizardSteps";

export default function AcademyEnrollmentForm({ courses = [] }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  //-----------------------------------------
  // Pricing
  //-----------------------------------------

  const pricing = useAcademyPricing(courses);

  //-----------------------------------------
  // Form
  //-----------------------------------------

  const methods = useForm({
    resolver: zodResolver(academyEnrollmentSchema),

    defaultValues: {
      first_name: "",
      last_name: "",
      other_name: "",
      gender: "",
      date_of_birth: "",

      email: "",
      phone: "",
      whatsapp: "",

      country: "",
      state: "",
      city: "",
      street_address: "",
      postal_code: "",

      preferred_start_date: "",
      learning_mode: "",
      payment_plan_id: "",

      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",

      occupation: "",
      education_level: "",
      referral_source: "",
      notes: "",

      total_course_fee: 0,
      courses: [],
    },
  });

  //-----------------------------------------
  // Wizard
  //-----------------------------------------

  const wizard = useWizard({
    steps: academyWizardSteps,
    methods,
  });

  //-----------------------------------------
  // RHF Sync
  //-----------------------------------------

  const {
    handleSubmit,
    reset,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (Object.keys(errors).length) {
      console.log("Validation Errors", errors);
    }
  }, [errors]);

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

  //-----------------------------------------
  // Submit
  //-----------------------------------------

  async function onSubmit(values) {
    clearErrors("root");

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

      reset();

      pricing.resetPricing();

      wizard.resetWizard();

      router.push("/academy/enrollment-success");
    } catch (error) {
      console.error(error);

      setError("root", {
        type: "manual",
        message: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    console.log("Validation Errors", methods.formState.errors);
  }, [methods.formState.errors]);
  //-----------------------------------------

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-5xl"
      >
        <AcademyEnrollmentWizard
          steps={academyWizardSteps}
          wizard={wizard}
          pricing={pricing}
          courses={courses}
          loading={loading}
          onSubmit={handleSubmit(onSubmit)}
        />

        {errors.root && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
