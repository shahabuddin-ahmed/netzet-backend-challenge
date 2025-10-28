import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AuthorQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    @MaxLength(128)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(128)
    lastName?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            return ['true', '1', 'yes'].includes(value.toLowerCase());
        }
        return undefined;
    })
    @IsBoolean()
    withBooks?: boolean;
}
