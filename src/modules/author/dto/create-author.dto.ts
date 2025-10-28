import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    lastName!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1024)
    bio?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;
}
