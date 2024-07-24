import { Gender } from "../constants/gender";
import { CreateAddress } from "./address";
import { UserRequest } from "./user";

type UserProfile = {
  fullname?: string;
  phone?: string;
  gender?: Gender;
  dob?: Date | string;
  addresses?: CreateAddress[];
  avatar?: string | File;
};

type UserProfileRequest = UserProfile;
type UserProfileResponse = UserRequest;

export type { UserProfile, UserProfileRequest, UserProfileResponse };
