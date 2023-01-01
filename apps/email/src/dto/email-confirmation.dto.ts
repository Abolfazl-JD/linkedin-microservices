import { IsNotEmpty, IsString } from "class-validator";

export class EmailConfirmationDto {
    @IsNotEmpty()
    @IsString()
    token: string
}