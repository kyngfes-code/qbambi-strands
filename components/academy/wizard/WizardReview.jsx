"use client";

import { useFormContext } from "react-hook-form";
import { CheckCircle2, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WizardReview({ pricing, wizard }) {
  const { getValues } = useFormContext();

  const values = getValues();

  const sections = [
    {
      title: "Personal Information",
      step: 0,
      items: [
        {
          label: "Full Name",
          value: [values.first_name, values.last_name, values.other_name]
            .filter(Boolean)
            .join(" "),
        },
        {
          label: "Gender",
          value: values.gender,
        },
        {
          label: "Date of Birth",
          value: values.date_of_birth,
        },
        {
          label: "Email",
          value: values.email,
        },
        {
          label: "Phone",
          value: values.phone,
        },
        {
          label: "WhatsApp",
          value: values.whatsapp,
        },
      ],
    },

    {
      title: "Address",
      step: 1,
      items: [
        {
          label: "Country",
          value: values.country,
        },
        {
          label: "State",
          value: values.state,
        },
        {
          label: "City",
          value: values.city,
        },
        {
          label: "Street",
          value: values.street_address,
        },
        {
          label: "Postal Code",
          value: values.postal_code,
        },
      ],
    },

    {
      title: "Training",
      step: 2,
      items: [
        {
          label: "Learning Mode",
          value: values.learning_mode,
        },
        {
          label: "Preferred Start",
          value: values.preferred_start_date,
        },
      ],
    },

    {
      title: "Payment",
      step: 3,
      items: [
        {
          label: "Payment Plan",
          value: values.payment_plan,
        },
        {
          label: "Total Tuition",
          value: `₦${Number(pricing.totalFee).toLocaleString()}`,
        },
      ],
    },

    {
      title: "Emergency Contact",
      step: 4,
      items: [
        {
          label: "Name",
          value: values.emergency_contact_name,
        },
        {
          label: "Phone",
          value: values.emergency_contact_phone,
        },
        {
          label: "Relationship",
          value: values.emergency_contact_relationship,
        },
      ],
    },

    {
      title: "Additional Information",
      step: 5,
      items: [
        {
          label: "Occupation",
          value: values.occupation,
        },
        {
          label: "Education",
          value: values.education_level,
        },
        {
          label: "Referral",
          value: values.referral_source,
        },
        {
          label: "Notes",
          value: values.notes,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-1 h-8 w-8 text-green-600" />

          <div>
            <h3 className="text-xl font-bold text-green-700">
              Review Your Application
            </h3>

            <p className="mt-2 leading-7 text-neutral-700">
              Please carefully review all the information below before
              submitting your enrollment. If you notice anything incorrect,
              click the <strong>Edit</strong> button beside the relevant
              section.
            </p>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-3xl border bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold">{section.title}</h3>

            <Button
              type="button"
              variant="outline"
              onClick={() => wizard?.goTo(section.step)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {section.items.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  {item.label}
                </p>

                <p className="mt-2 break-words font-medium text-neutral-800">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-3xl border bg-[#C6A667]/10 p-6">
        <h3 className="text-xl font-semibold">Selected Courses</h3>

        <div className="mt-5 space-y-4">
          {pricing.selectedCourses.map((course) => (
            <div
              key={course.courseId}
              className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {pricing.getCourse(course.courseId)?.title}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {course.duration} Month
                  {course.duration > 1 ? "s" : ""}
                </p>
              </div>

              <div className="text-lg font-bold text-[#b48a5a]">
                ₦{Number(course.price).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <span className="text-lg font-semibold">Total Tuition</span>

          <span className="text-3xl font-bold text-[#b48a5a]">
            ₦{Number(pricing.totalFee).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
