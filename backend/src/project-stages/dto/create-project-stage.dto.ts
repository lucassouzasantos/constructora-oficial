import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProjectStageDto {
    @IsString()
    name: string;

    @IsNumber()
    projectId: number;

    @IsString()
    @IsOptional()
    startDatePlanned?: string;

    @IsString()
    @IsOptional()
    endDatePlanned?: string;

    @IsString()
    @IsOptional()
    startDateReal?: string;

    @IsString()
    @IsOptional()
    endDateReal?: string;

    @IsString()
    @IsOptional()
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}
