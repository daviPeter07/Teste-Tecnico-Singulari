import { ApiProperty } from '@nestjs/swagger';

type UserResponseDtoParams = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export class UserResponseDto {
  @ApiProperty({
    example: '1b03e8a4-5bb3-44e1-9f59-d2dfc8d6734f',
  })
  id: string;

  @ApiProperty({
    example: 'Jane Doe',
  })
  name: string;

  @ApiProperty({
    example: 'jane.doe@example.com',
  })
  email: string;

  @ApiProperty({
    example: '2026-06-23T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-24T15:30:00.000Z',
  })
  updatedAt: Date;

  constructor(params: UserResponseDtoParams) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromEntity(user: UserResponseDtoParams): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
