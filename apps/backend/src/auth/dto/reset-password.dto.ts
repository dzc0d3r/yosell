import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The password reset token from the email link.',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsString()
  @IsUUID('4')
  token: string;

  @ApiProperty({
    description: 'The new password (must be at least 8 characters).',
    example: 'MyNewSecurePassword123',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  newPassword: string;
}
