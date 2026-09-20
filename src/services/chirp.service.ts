import {
  createChirp,
  getChirps,
  getChirp,
  deleteChirp,
  getChirpsByAuthor,
} from "../db/queries/chirps.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/http-errors.js";

export async function createUserChirp(
  body: string,
  userId: string,
) {
  if (!body || body.length > 140) {
    throw new BadRequestError(
      "Chirp is too long. Max length is 140",
    );
  }

  const cleanedBody = body
    .replace(/kerfuffle/gi, "****")
    .replace(/sharbert/gi, "****")
    .replace(/fornax/gi, "****");

  return await createChirp({
    body: cleanedBody,
    userId,
  });
}

export async function listChirps(
  authorId?: string,
  sort?: string,
) {
  let chirps;

  if (authorId) {
    chirps = await getChirpsByAuthor(authorId);
  } else {
    chirps = await getChirps();
  }

  if (sort === "desc") {
    chirps.reverse();
  }

  return chirps;
}

export async function getChirpById(chirpId: string) {
  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  return chirp;
}

export async function deleteUserChirp(
  chirpId: string,
  userId: string,
) {
  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  if (chirp.userId !== userId) {
    throw new ForbiddenError(
      "You do not have permission to delete this chirp",
    );
  }

  await deleteChirp(chirp.id);
}