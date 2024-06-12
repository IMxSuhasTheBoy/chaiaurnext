import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";

import { ApiResponse } from "../types/ApiResponse";

export async function sendVerificationEmail(
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    //no data error extracted yet
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Feedback service Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return {
      success: true,
      message: "Verification email sent successfully!!!",
    };
  } catch (emailError) {
    console.error("\nError sending verification email! ! !", emailError);
    return {
      success: false,
      message: "Error sending verification email! ! !",
    };
  }
}
