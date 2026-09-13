"use client";

import AdditionalInformation from "../sections/AdditionalInformation";
import AddressInformation from "../sections/AddressInformation";
import EmergencyContact from "../sections/EmergencyContact";
import PaymentInformation from "../sections/PaymentInformation";
import PersonalInformation from "../sections/PersonalInformation";
import TrainingInformation from "../sections/TrainingInformation";
import WizardReview from "../wizard/WizardReview";

// ==========================================================
// NEW STUDENT STEPS
// ==========================================================

const newStudentSteps = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Tell us about yourself.",
    component: PersonalInformation,
    fields: [
      "first_name",
      "last_name",
      "other_name",
      "gender",
      "date_of_birth",
      "email",
      "phone",
      "whatsapp",
    ],
  },

  {
    id: "address",
    title: "Address",
    description: "Where do you currently live?",
    component: AddressInformation,
    fields: ["country", "state", "city", "street_address", "postal_code"],
  },

  {
    id: "training",
    title: "Training",
    description: "Select your courses.",
    component: TrainingInformation,
    fields: ["preferred_start_date", "learning_mode"],
  },

  {
    id: "payment",
    title: "Payment",
    description: "Choose a payment option.",
    component: PaymentInformation,
    fields: ["payment_plan_id"],
  },

  {
    id: "emergency",
    title: "Emergency Contact",
    description: "Someone we can contact.",
    component: EmergencyContact,
    fields: [
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relationship",
    ],
  },

  {
    id: "additional",
    title: "Additional Information",
    description: "Almost finished.",
    component: AdditionalInformation,
    fields: [
      "occupation",
      "education_level",
      "referral_source",
      "notes",
      "terms",
    ],
  },

  {
    id: "review",
    title: "Review",
    description: "Review your application.",
    component: WizardReview,
    fields: [],
  },
];

// ==========================================================
// EXISTING STUDENT STEPS
//
// Existing academy students already have:
//
// - Personal information
// - Address information
// - Emergency contact
// - Additional information
//
// They only need to complete:
//
// 1. Training
// 2. Payment
// 3. Review
// ==========================================================

const existingStudentSteps = [
  {
    id: "training",
    title: "Training",
    description: "Select the courses you would like to add.",
    component: TrainingInformation,
    fields: ["preferred_start_date", "learning_mode"],
  },

  {
    id: "payment",
    title: "Payment",
    description: "Choose a payment option for your new courses.",
    component: PaymentInformation,
    fields: ["payment_plan_id"],
  },

  {
    id: "review",
    title: "Review",
    description: "Review your course selection and payment details.",
    component: WizardReview,
    fields: [],
  },
];

// ==========================================================
// STEP BUILDER
// ==========================================================

export default function getAcademyWizardSteps({
  isExistingStudent = false,
} = {}) {
  return isExistingStudent ? existingStudentSteps : newStudentSteps;
}
