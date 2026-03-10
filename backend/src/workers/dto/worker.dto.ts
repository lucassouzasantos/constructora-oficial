export class CreateWorkerDto {
    name: string;
    role?: string;
    dailyRate: number;
    phone?: string;
}

export class UpdateWorkerDto {
    name?: string;
    role?: string;
    dailyRate?: number;
    phone?: string;
    active?: boolean;
}
