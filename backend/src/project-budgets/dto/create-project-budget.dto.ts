import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProjectBudgetDto {
    @IsString()
    @IsNotEmpty()
    category: string;

    @IsNotEmpty()
    amount: number | string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty()
    projectId: number | string;
}
