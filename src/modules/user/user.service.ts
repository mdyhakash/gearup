import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./user.interface";
import config from "../../config";

const registerUser = async (payload: IRegisterUser) => {
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

export const userServices = {
  registerUser,
};
