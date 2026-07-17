import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IUserQuery {
  role?: Role;
  status?: UserStatus;
  searchTerm?: string;
  page?: string;
  limit?: string;
}

export interface IUpdateUserStatus {
  status: UserStatus;
}

export interface IAdminGearQuery {
  page?: string;
  limit?: string;
}

export interface IAdminRentalQuery {
  status?: string;
  page?: string;
  limit?: string;
}
