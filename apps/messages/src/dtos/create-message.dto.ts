import { IsNotEmpty, IsPositive, IsString } from "class-validator"

export class CreateMessageDto {
    @IsPositive()
    @IsNotEmpty()
    conversationId: number

    @IsString()
    @IsNotEmpty()
    text: string
}