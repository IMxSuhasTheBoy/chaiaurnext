import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters long")
  .max(20, "Username must be at most 20 characters long")
  .regex(
    /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,19}$/,
    "Username can contain characters a-z, 0-9, underscores and periods, cannot start nor end with a period, no more than one period sequentially. Max length is 20 chars! ! !"
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({
    message: "Invalid email address! ! !",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 8 characters long" }),
});

// .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])\S{8,25}$/, {
//   message:
//     "Password must be at least 8 characters long upto 25, must contain at least one uppercase letter, one lowercase letter, one number and one special character! ! !",
// }),
