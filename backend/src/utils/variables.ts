const { env } = process as { env: { [key: string]: string } };

export const {
  PORT = 8989,
  MONGO_URI = '',
  MAIL_USER,
  MAIL_PASS
} = env;
