export class CreateWorkLogDto {
    workerId: number;
    projectId: number;
    date: string;
    days: number;
    description?: string;
}

export class UpdateWorkLogDto {
    days?: number;
    description?: string;
    date?: string;
}
