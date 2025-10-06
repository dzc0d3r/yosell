import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'ali.baba@yosell.app',
    description: 'The email address of the account to reset the password for.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
