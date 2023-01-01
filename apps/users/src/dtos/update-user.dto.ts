import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MinLength(1)
    firstName: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    lastName: string

    @IsOptional()
    @IsString()
    @IsEmail()
    email: string

    @IsOptional()
    @MinLength(8)
    @MaxLength(30)
    password: string

    @IsOptional()
    @MinLength(8)
    @MaxLength(30)
    oldPassword: string
}