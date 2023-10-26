const { env } = process as { env: { [key: string]: string } };

export const PORT = env.PORT || 8989;
export const MONGO_URI = env.MONGO_URI || '';
