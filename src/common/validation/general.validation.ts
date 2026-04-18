import { z } from "zod";
export const generalValidationFields = {
  username: z.coerce
    .string({ error: "Make sure to include a valid username" })
    .min(2, { error: "Minimum characters are 2" })
    .max(25, { error: "max characters are 25" }),
  email: z.email({ error: "Make sure to include a valid email address" }),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, {
      error: "Make sure to follow the indicated password pattern",
    }),
  phone: z
    .string("Phone number is required")
    .regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/, {
      error: "Make sure to enter a valid phone number",
    }),
  confirmPassword: z.coerce.string(),
  gender: z.enum(["male", "female"], {
    error: "Gender must be either male or female",
  }),
  otp: z.string("OTP code is required").regex(/^\d{6}$/, {
    error: "Make sure to enter a valid OTP code",
  }),
};
