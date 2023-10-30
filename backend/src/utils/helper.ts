export const generateToken = (length = 6): string => {
  let token = '';

  for (let i = 0; i < length; i++) {
    const digit = (Math.random() * 10).toFixed(0);

    token += digit;
  }

  return token;
}
