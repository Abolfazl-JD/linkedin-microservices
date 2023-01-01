import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class RegisterUserDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    firstName: string

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    lastName: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(30)
    password: string
}