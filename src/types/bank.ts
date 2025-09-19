import { IQuestion } from "./question";
import { User } from "./user";

export interface IBank {
  id: number;
  title: string;
  userId: string;
  type: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  questions?: IQuestion[];
}
