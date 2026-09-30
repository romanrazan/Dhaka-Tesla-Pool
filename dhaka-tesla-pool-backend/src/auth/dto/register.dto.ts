import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nusrat' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'nusrat@dhakapool.local' })
  @IsEmail()
  @MaxLength(180)
  email: string;

  @ApiPropertyOptional({ example: '+8801711000001' })
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone?: string;

  @ApiProperty({ minLength: 8, example: 'Pool123!' })
  @IsString()
  @Length(8, 72)
  password: string;
}
