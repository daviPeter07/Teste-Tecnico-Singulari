import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

type AuthResponseDtoParams = {
  accessToken: string;
  user: UserResponseDto;
};

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    type: UserResponseDto,
  })
  user: UserResponseDto;

  constructor(params: AuthResponseDtoParams) {
    this.accessToken = params.accessToken;
    this.user = params.user;
  }
}
