import { IQuestion } from "./question";

export interface IBank {
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;

    questions: IQuestion[]
}