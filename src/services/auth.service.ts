import { config } from "../config.js";
import {
  checkPasswordHash,
  makeJWT,
  makeRefreshToken,
} from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import {
  createRefreshToken,
  getUserFromRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refreshTokens.js";
import { UnauthorizedError } from "../errors/http-errors.js";

export async function loginUser(
  email: string,
  password: string,
) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const passwordMatch = await checkPasswordHash(
    password,
    user.hashedPassword,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const token = makeJWT(
    user.id,
    3600,
    config.api.jwtSecret,
  );

  const refreshToken = makeRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60);

  await createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  const { hashedPassword: _, ...userResponse } = user;

  return {
    ...userResponse,
    token,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const token = await getUserFromRefreshToken(refreshToken);

  if (!token) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (token.revokedAt) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (token.expiresAt <= new Date()) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  return makeJWT(
    token.userId,
    3600,
    config.api.jwtSecret,
  );
}

export async function revokeUserRefreshToken(refreshToken: string) {
  await revokeRefreshToken(refreshToken);
}