import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
// import { verifySchema } from "@/schemas/verifySchema";
// import { z } from "zod";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);

    //todo:1 find user
    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found! ! !",
        },
        {
          status: 500,
        }
      );
    }

    //todo:2 check code & expiry date with live date
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    //todo:3 valid & not expired :- update user verified flag
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successfully!!!",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      //code has expired case
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired, please signup again to get a new code! ! !",
        },
        {
          status: 400,
        }
      );
    } else {
      //code invalid case
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code! ! !",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying user! ! !",
      },
      {
        status: 500,
      }
    );
  }
}
