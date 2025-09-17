export interface IAnswer {
    id: number;
    option: string;
    text: string;
    questionId: number;
    isTrue: boolean;
    createdAt: Date;
    updatedAt: Date;
}