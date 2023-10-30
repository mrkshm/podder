import nodemailer from "nodemailer";
import { RequestHandler } from "express";
import path from "path";

import { CreateUser } from "@/types/user";
import { MAIL_USER, MAIL_PASS } from "@/utils/variables";
import User from "@/models/user";
import EmailToken from "@/models/emailToken";
import { generateToken } from "@/utils/helper";
import { generateTemplate } from "@/email/template";

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ email, password, name });

  // send verification email
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    }
  });

  const token = generateToken();
  await EmailToken.create({
    owner: user._id,
    token: token
  })

  const welcomeMessage = `Hi ${name}, welcome to Podder! There are so much things to do for verified users. Use the given code to verify your account.`;

  transport.sendMail({
    to: user.email,
    from: "auth@podder.com",
    html: generateTemplate({
      title: "Welcome to Podder !",
      message: welcomeMessage,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../email/logo.png"),
        cid: "logo"
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../email/welcome.png"),
        cid: "welcome"
      }
    ]
  })

  res.status(201).json(user);
}

