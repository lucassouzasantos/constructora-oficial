import { IsString, IsOptional, IsDateString, IsNumber, ValidateIf } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsNumber()
    totalArea?: number;

    @IsOptional()
    @IsNumber()
    salesValue?: number;

    @ValidateIf(o => o.startDate !== null && o.startDate !== undefined)
    @IsDateString()
    startDate?: string | null;

    @ValidateIf(o => o.endDate !== null && o.endDate !== undefined)
    @IsDateString()
    endDate?: string | null;

    @IsOptional()
    @IsNumber()
    customerId?: number;

    @IsOptional()
    @IsString()
    status?: string;
}
