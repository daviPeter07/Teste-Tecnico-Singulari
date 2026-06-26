import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Match } from '../../../common/validation/match.decorator';

export class RegisterDto {
  @ApiProperty({
    example: 'Jane Doe',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strong-password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'strong-password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Match<RegisterDto>('password', {
    message: 'confirmPassword must match password',
  })
  confirmPassword: string;
}
