import { IsOptional, IsPositive } from "class-validator"

export class GetFeedsDto {
    @IsOptional()
    @IsPositive()
    take: number

    @IsOptional()
    @IsPositive()
    skip: number
}