import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

//Docs https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    //todo:1 find user
    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    //todo:2 exits ? API Response 400 : further identifer checks
    if (existingVerifiedUserByUsername)
      return Response.json(
        {
          success: false,
          message: "Username is already taken! ! !",
        },
        { status: 400 }
      );

    //todo:1 find user
    const existingUserByEmail = await UserModel.findOne({ email });
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    //todo: 2 exits ? (isVerified ? API Response 400 : save dets & send email) : register it's a new user.
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email is already taken! ! !", //? will email still gona be sent? : NO
          },
          { status: 400 }
        );
      } else {
        // save existing user with new password and verify code
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      } //!check after updation isVerified bool toggles
    } else {
      // register him in db, it's a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    } //checks end

    //TODO: send email & respond the signUp API Response to end flow
    const emailResponse = await sendVerificationEmail(
      username,
      email,
      verifyCode
    );
    if (!emailResponse.success)
      return Response.json(
        {
          sucess: false,
          message: emailResponse.message,
        },
        { status: 500 }
      ); //?What if email not sent.

    return Response.json(
      {
        sucess: true,
        message: "User registered successfully, Please verify your email!!!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("\nError while registering user! ! !", error);
    //!use ApiResponse interface
    return Response.json(
      {
        success: false,
        message: "Error while registering user! ! !",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 *  Flow for customised sign up in house with opt verification call
if (existingUserByEM){

     if (existingUserByEM.isVerified){
        success: false, //API Res ends
     }else{
        //Save the updated user details:pw (auto call otp fn)
     }//!

}else {
    // Create a new user with the provided details
    // Save the new user (auto call otp fn)
}//!

    //(otp verification sending code here, also API Res ends)
 * 
 */