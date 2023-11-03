import nodemailer from "nodemailer";
import path from "path";
import { generateTemplate } from "@/email/template";
import { MAIL_USER, MAIL_PASS, SIGN_IN_URL, VERIFICATION_EMAIL } from "@/utils/variables";

const createMailTransporter = () => {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    }
  });
};

interface Profile {
  name: string,
  email: string,
  userId: string
}

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = createMailTransporter();
  const { name, email, userId } = profile;

  const welcomeMessage = `Hi ${name}, welcome to Podder! There are so much things to do for verified users. Use the given code to verify your account.`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Welcome to Podder",
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
};


interface Options {
  email: string;
  link: string;
}

export const sendForgotPasswordLink = async (options: Options) => {
  const transport = createMailTransporter();
  const { email, link } = options;

  const message = `We just received a request to reset your password. It you did not do that, just ignore this message. Otherwise, click on the link below.`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Reset password link",
    html: generateTemplate({
      title: "Reset Password",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link,
      btnTitle: "Reset Password"
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../email/logo.png"),
        cid: "logo"
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../email/forget_password.png"),
        cid: "forget_password"
      }
    ]
  })
};

export const sendPasswordResetSuccessEmail = async (name: string, email: string) => {
  const transport = createMailTransporter();

  const message = `Dear ${name}, we just updated your password. You can now sign in using your new password.`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Password Reset Successful",
    html: generateTemplate({
      title: "Reset Password",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: SIGN_IN_URL,
      btnTitle: "Login"
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../email/logo.png"),
        cid: "logo"
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../email/forget_password.png"),
        cid: "forget_password"
      }
    ]
  })
};
