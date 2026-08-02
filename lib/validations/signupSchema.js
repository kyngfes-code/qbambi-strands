import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(50, "First name is too long."),

    middleName: z
      .string()
      .trim()
      .max(50, "Middle name is too long.")
      .optional()
      .or(z.literal("")),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .max(50, "Last name is too long."),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .transform((value) => value.toLowerCase()),

    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(20, "Phone number is too long.")
      .regex(/^[+]?[0-9()\-\s]+$/, "Enter a valid phone number."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password is too long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain an uppercase letter, a lowercase letter and a number.",
      ),

    confirmPassword: z.string(),

    street: z
      .string()
      .trim()
      .min(5, "Enter your street address.")
      .max(255, "Street address is too long."),

    city: z
      .string()
      .trim()
      .min(2, "Enter your city.")
      .max(100, "City name is too long."),

    state: z
      .string()
      .trim()
      .min(2, "Enter your state/province.")
      .max(100, "State name is too long."),

    country: z.string().trim().min(2, "Please select your country.").max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
