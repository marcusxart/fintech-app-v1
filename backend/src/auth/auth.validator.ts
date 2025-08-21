import { z } from "zod";

// Create Account
export const createAccountSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters"),
      email: z.string().email("Invalid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
      confirmPassword: z
        .string()
        .min(8, "Confirm password must be at least 8 characters"),
      countryCode: z
        .string()
        .regex(/^\+\d{1,4}$/, "Invalid country code (e.g., +1, +234)"),
      phoneNumber: z
        .string()
        .regex(/^\d{7,15}$/, "Invalid phone number (must be 7–15 digits)"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

// Login
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password is required"),
  }),
});

// Change Password
export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z.string().min(8, "Old password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
      confirmPassword: z.string().min(8, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

// Forgot Password (request reset link)
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

// Reset Password
export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(10, "Reset token is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
      confirmPassword: z.string().min(8, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

// Verify Email
export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(10, "Verification token is required"),
  }),
});
