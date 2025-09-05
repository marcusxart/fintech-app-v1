const { z } = require("zod");

// 🔹 Common Fields
const emailField = z
  .string("Email is required")
  .trim()
  .nonempty("Email is required")
  .email("Please enter a valid email address");

const passwordField = z
  .string("Password is required")
  .trim()
  .nonempty("Password is required")
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

const confirmPasswordField = z
  .string("Confirm password is required")
  .trim()
  .nonempty("Please confirm your password")
  .min(8, "Confirm password must be at least 8 characters long");

const codeField = z
  .string("Code is required")
  .trim()
  .nonempty("Code is required")
  .min(6, "Invalid code. Please check and try again.");

const nameField = (label = "Name") =>
  z
    .string(`${label} is required`)
    .trim()
    .nonempty(`Please enter your ${label.toLowerCase()}`)
    .min(3, `${label} must be at least 3 characters long`);

const dialCodeField = z
  .string({ required_error: "Dial code is required" })
  .trim()
  .nonempty("Dial code is required")
  .regex(
    /^\+\d{1,4}$/,
    "Invalid dial code. Please use a format like +1 or +234"
  );

const phoneNumberField = z
  .string("Phone number is required")
  .trim()
  .nonempty("Phone number is required")
  .regex(
    /^\d{7,15}$/,
    "Invalid phone number. It must be between 7 and 15 digits"
  );

// 🔹 Schemas

// Create Account
const createAccountSchema = z.object({
  body: z
    .object({
      firstName: nameField("First name"),
      lastName: nameField("Last name"),
      email: emailField,
      password: passwordField,
      confirmPassword: confirmPasswordField,
      dialCode: dialCodeField,
      phoneNumber: phoneNumberField,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match. Please try again.",
      path: ["confirmPassword"],
    }),
});

// Login
const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
});

// Change Password
const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: passwordField.min(
        8,
        "Old password must be at least 8 characters long"
      ),
      newPassword: passwordField,
      confirmPassword: confirmPasswordField,
      code: codeField.optional(), // OTP if you want to enforce it
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New passwords do not match. Please try again.",
      path: ["confirmPassword"],
    }),
});

// Require email
const emailSchema = z.object({
  body: z.object({
    email: emailField,
  }),
});

// Reset Password
const resetPasswordSchema = z.object({
  body: z
    .object({
      email: emailField,
      code: codeField,
      newPassword: passwordField,
      confirmPassword: confirmPasswordField,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New passwords do not match. Please try again.",
      path: ["confirmPassword"],
    }),
});

// Verify Email
const verifyEmailSchema = z.object({
  body: z.object({
    email: emailField,
    code: codeField,
  }),
});

module.exports = {
  createAccountSchema,
  loginSchema,
  changePasswordSchema,
  emailSchema,
  resetPasswordSchema,
  verifyEmailSchema,
};
