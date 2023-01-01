import { IsNotEmpty, IsString } from "class-validator";

export class ValidateUserDto {
    @IsNotEmpty()
    @IsString()
    token: string
}