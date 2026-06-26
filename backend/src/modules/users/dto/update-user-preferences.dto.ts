import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class UpdateUserPreferencesDto {
  @ApiProperty({
    example: ['b8f8c3f7-6f4d-4e43-91d2-4d1f9b3c6d15'],
    type: [String],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
