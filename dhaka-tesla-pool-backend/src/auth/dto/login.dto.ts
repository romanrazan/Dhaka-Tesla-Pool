import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'nusrat@dhakapool.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Pool123!' })
  @IsString()
  @Length(8, 72)
  password: string;
}
