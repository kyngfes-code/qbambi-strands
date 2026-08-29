import { z } from "zod";

export const academyEnrollmentSchema = z.object({
  // =========================
  // PERSONAL INFORMATION
  // =========================

  first_name: z.string().trim().min(2, "First name is required"),

  last_name: z.string().trim().min(2, "Last name is required"),

  other_name: z.string().optional(),

  gender: z.enum(["Male", "Female"], {
    required_error: "Please select your gender",
  }),

  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (value) => {
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        return value < todayString;
      },
      {
        message: "Date of birth cannot be today or a future date",
      },
    ),

  email: z.string().trim().email("Enter a valid email address"),

  phone: z.string().trim().min(10, "Phone number is required"),

  whatsapp: z.string().optional(),

  // =========================
  // ADDRESS
  // =========================

  country: z.string().trim().min(2, "Country is required"),

  state: z.string().trim().min(2, "State is required"),

  city: z.string().optional(),

  street_address: z.string().optional(),

  postal_code: z.string().optional(),

  // =========================
  // TRAINING
  // =========================

  preferred_start_date: z
    .string()
    .min(1, "Preferred start date is required")
    .refine(
      (value) => {
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        return value >= todayString;
      },
      {
        message: "Preferred start date cannot be in the past",
      },
    ),

  learning_mode: z.enum(["physical", "online", "hybrid"], {
    required_error: "Please choose a learning mode",
  }),

  payment_plan_id: z.string().uuid({
    message: "Please choose a payment plan",
  }),

  total_course_fee: z.number().nonnegative(),

  // =========================
  // COURSES
  // =========================

  courses: z
    .array(
      z.object({
        course_id: z.string().uuid(),

        pricing_id: z.string().uuid(),

        duration_months: z.number().min(1),

        amount: z.number().positive(),
      }),
    )
    .min(1, "Select at least one course"),

  // =========================
  // EMERGENCY CONTACT
  // =========================

  emergency_contact_name: z
    .string()
    .trim()
    .min(2, "Emergency contact name is required"),

  emergency_contact_phone: z
    .string()
    .trim()
    .min(7, "Emergency contact phone is required"),

  emergency_contact_relationship: z
    .string()
    .trim()
    .min(2, "Relationship is required"),

  // =========================
  // ADDITIONAL INFORMATION
  // =========================

  occupation: z.string().optional(),

  education_level: z.string().optional(),

  referral_source: z.string().optional(),

  notes: z.string().optional(),

  terms: z.boolean().refine((value) => value === true, {
    message: "You must confirm the agreement before submitting.",
  }),
});

export default academyEnrollmentSchema;
