import { Type } from "class-transformer"
import { IsOptional, IsPositive } from "class-validator"

export class GetFeedsDto {
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    take: number

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    skip: number
}