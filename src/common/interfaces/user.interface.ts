import { GenderEnum, RoleEnum } from "../enums";

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
  DOB?: Date;
  provider: number;
  confirmedAt?: Date;
  profileImage: string;
  coverImages?: string[];
  role: RoleEnum;
  gender: GenderEnum;
  createdAt?: Date;
  updatedAt?: Date;
  paranoid?: boolean;
  deletedAt?: Date;
  restoredAt?: Date;
  changedCredentialsTime?: Date;
  extra: {
    _name: string;
  };
}
