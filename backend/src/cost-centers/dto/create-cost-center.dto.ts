import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCostCenterDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsOptional()
    @IsNumber()
    budget?: number;
}
