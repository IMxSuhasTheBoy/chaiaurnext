import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth"; //session access
import { authOptions } from "../auth/[...nextauth]/options"; //credentials provider
import UserModel from "@/model/User.model";
import { User } from "next-auth";

//TODO: logged in user can toggle his accept messages flag
export async function POST(request: Request) {
  await dbConnect();

  //todo:1 get current logged in user & userId
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized! ! !",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;

  //todo: 2 update user status to accept messages : expected flag from frontend
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessages: acceptMessages,
      },
      { new: true }
    );

    if (!updatedUser) {
      // User not found
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages! ! !",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      // Successfully updated message acceptance status
      {
        success: true,
        message: "Message acceptance status updated successfully! ! !",
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to update user status to accept messages:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages! ! !",
      },
      {
        status: 500,
      }
    );
  }
}

//TODO: logged in user can retrieve his accept messages flag status
export async function GET(request: Request) {
  await dbConnect();

  //todo:1 get current logged in user & userId
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized! ! !",
      },
      {
        status: 401,
      }
    );
  }

  try {
    //todo:2 find user
    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      // User not found
      return Response.json(
        {
          success: false,
          message: "User not found! ! !",
        },
        {
          status: 404,
        }
      );
    }

    // Return the user's message acceptance status
    return Response.json(
      {
        success: true,
        isAccptingMessages: foundUser.isAcceptingMessages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status:", error);
    return Response.json(
      {
        success: false,
        message: "Error retrieving message acceptance status! ! !",
      },
      { status: 500 }
    );
  }
}
