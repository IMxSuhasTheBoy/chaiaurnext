import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

//TODO: asa user entering the username in field the get req is to be fired to show user live if the username is taken or not
export async function GET(request: Request) {
  // console.log(request.method, ": request.method");
  /** legacy checks no longer needed manually
   * if (request.method !== "GET") {
    return Response.json(
      {
        success: false,
        message: "Invalid request method! ! !",
      },
      { status: 405 }
    );
  }
   */

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    //validate query params with zod
    const result = UsernameQuerySchema.safeParse(queryParams);
    console.log("result", result); //                        !log
    //result { success: true, data: { username: 'one' } }

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters! ! !",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVarifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    //case isVerified: true
    if (existingVarifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken! ! !",
        },
        {
          status: 400,
        }
      );
    }

    //case isVerified: false
    return Response.json(
      {
        success: true,
        message: "Username is unique!!!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Error while checking username",
      },
      {
        status: 500,
      }
    );
  }
}
