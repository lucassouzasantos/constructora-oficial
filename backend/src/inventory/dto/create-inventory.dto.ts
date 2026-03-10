import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInventoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty()
    quantity: number | string;

    @IsString()
    @IsNotEmpty()
    unit: string;

    @IsOptional()
    minQuantity?: number | string;

    @IsOptional()
    unitValue?: number | string;

    @IsOptional()
    projectId?: number | string;
}
