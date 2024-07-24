import { UUID } from "crypto";
import { Role } from "../constants/role";
import { Gender } from "../constants/gender";
import { CreateAddress } from "./address";

type User = {
  userId: UUID;
  fullname: string;
  email: string;
  phone: string;
  isVerified: boolean;
  gender: Gender;
  role: Role;
  dob?: Date | string;
  addresses: CreateAddress[];
  avatar: string | File;
  isActive?: boolean;
};

type KeyString = {
  [key: string]: any;
};

type UserForLoop = User & KeyString;

type UserRequest = Omit<User, "userId" | "isVerified">;
type UserResponse = User;

type AdminUser = {
  fullname?: string;
  email?: string;
  phone?: string;
  dob?: Date | string;
  gender?: Gender;
  defaultAddress?: string;
  avatar?: string | File;
};
type AdminUserRequest = AdminUser;

export type {
  User,
  UserResponse,
  UserRequest,
  UserForLoop,
  KeyString,
  AdminUser,
  AdminUserRequest,
};
