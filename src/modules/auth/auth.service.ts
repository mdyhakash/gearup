import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IAuthUser } from "./auth.interface";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";

const registerUser = async (payload: IAuthUser) => {
  const { name, email, password, profilePhoto } = payload;

  //check user exits
  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new Error("User already exists");
  }

  //hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

  const createUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      profile: {
        create: {
          profilePhoto,
        },
      },
    },
  });
  const user = await prisma.user.findUnique({
    where: {
      id: createUser.id,
      email: createUser.email,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return user;
};

const loginUser = async (payload: IAuthUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findFirstOrThrow({
    where: { email },
  });

  //password match
  const matchedPassowrd = await bcrypt.compare(password, user.password);
  if (!matchedPassowrd) {
    throw new Error("Invalid credintials");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtpayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );
  const refreshToken = jwtUtils.createToken(
    jwtpayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  const verfiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verfiedToken.success) {
    throw new Error(verfiedToken.error);
  }

  const { id } = verfiedToken.data as JwtPayload;

  const user = await prisma.user.findFirstOrThrow({
    where: { id },
  });

  if (user.status === "BLOCKED") {
    throw new Error("user is blocked");
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtpayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  return { accessToken };
};
export const authServices = {
  registerUser,
  loginUser,
  refreshToken,
};
