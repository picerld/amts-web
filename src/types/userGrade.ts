import { IBank } from "./bank";
import { User } from "./user";

export interface IUserGrade {
  id: string;
  userId: string;
  grade: number;
  bankId: number;
  createdAt: Date;
  updatedAt: Date;

  bank: IBank;
  user: User;
}
