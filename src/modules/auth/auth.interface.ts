import { Role } from "../../../generated/prisma/enums";

export interface IAuthUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  profilePhoto?: string;
  bio?: string;
}
