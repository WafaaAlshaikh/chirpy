import { hashPassword } from "../auth.js";
import {
  createUser,
  updateUser,
} from "../db/queries/users.js";

export async function registerUser(
  email: string,
  password: string,
) {
  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    email,
    hashedPassword,
  });

  const { hashedPassword: _, ...userResponse } = user;

  return userResponse;
}

export async function updateUserProfile(
  userId: string,
  email: string,
  password: string,
) {
  const hashedPassword = await hashPassword(password);

  const user = await updateUser(
    userId,
    email,
    hashedPassword,
  );

  const { hashedPassword: _, ...userResponse } = user;

  return userResponse;
}