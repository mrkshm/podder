import { UserDocumentWithId } from "@/models/user";

export const generateToken = (length = 6): string => {
  let token = '';

  for (let i = 0; i < length; i++) {
    const digit = (Math.random() * 10).toFixed(0);

    token += digit;
  }

  return token;
}

export const formatProfile = (user: UserDocumentWithId) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  }

} 
