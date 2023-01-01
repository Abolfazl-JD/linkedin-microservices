import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { StatusEnum } from "../connection-req.entity";

export class UpdateConnectionDto {
    @IsNotEmpty()
    @IsEnum(StatusEnum)
    status: StatusEnum
}