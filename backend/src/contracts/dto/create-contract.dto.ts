import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    projectId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    customerId?: number;
}
