import { User } from "./user";

export interface IRole {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  users?: User[];
}
