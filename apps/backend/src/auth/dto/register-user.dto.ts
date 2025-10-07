import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isValidPhoneNumber } from 'libphonenumber-js';

@ValidatorConstraint({ name: 'isAlgerianPhoneNumber', async: false })
export class IsAlgerianPhoneNumber implements ValidatorConstraintInterface {
  validate(phoneNumber: string, args: ValidationArguments) {
    return isValidPhoneNumber(phoneNumber, 'DZ');
  }

  defaultMessage(args: ValidationArguments) {
    return 'Phone number must be a valid Algerian number.';
  }
}
export class RegisterUserDto {
  @ApiProperty({
    example: 'Ali Baba',
    description: 'The full name of the seller.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    example: 'ali.baba@yosell.app',
    description: 'The unique email address for the seller.',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'MySecurePassword123',
    description: 'The seller password (must be at least 8 characters).',
    required: true,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
  @ApiProperty({
    example: '0512345678', // Example of an Algerian number
    description: "The seller's valid Algerian phone number (+213).",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsAlgerianPhoneNumber)
  phoneNumber: string;
}
