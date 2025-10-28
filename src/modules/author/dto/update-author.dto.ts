import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAuthorDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  bio?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
