import { IRole } from "./role";

export interface User {
  id: string;
  username: string;
  password: string;
  token: string | null;
  roleId: number;
  role?: IRole;
  createdAt: Date;
  updatedAt: Date;
}
