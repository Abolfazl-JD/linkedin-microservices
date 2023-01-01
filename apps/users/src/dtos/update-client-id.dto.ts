import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class UpdateClientIdDto {
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    clientId: string
}