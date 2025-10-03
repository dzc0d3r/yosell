import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'The verification token from the magic link.',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4') // Ensure it's a valid UUIDv4
  token: string;
}
