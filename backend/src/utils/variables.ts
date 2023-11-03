const { env } = process as { env: { [key: string]: string } };

export const {
  PORT = 8989,
  MONGO_URI = '',
  MAIL_USER,
  MAIL_PASS,
  VERIFICATION_EMAIL,
  PASSWORD_RESET_LINK,
  SIGN_IN_URL,
  JWT_SECRET,
  CLOUD_KEY,
  CLOUD_SECRET,
  CLOUD_NAME
} = env;
