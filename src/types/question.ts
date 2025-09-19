import { IAnswer } from "./answer";

export interface IQuestion {
  id: number;
  question: string;
  createdAt: Date;
  updatedAt: Date;
  answers?: IAnswer[];
}
