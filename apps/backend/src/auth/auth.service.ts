import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as argon2 from 'argon2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

async register(registerUserDto: RegisterUserDto) {
    // 1. Check for email conflict
    const existingUserByEmail = await this.usersService.findByEmail(registerUserDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('A user with this email already exists.');
    }

    // 2. Parse and standardize the phone number
    const phoneNumber = parsePhoneNumberFromString(registerUserDto.phoneNumber, 'DZ');
    if (!phoneNumber || !phoneNumber.isValid()) {
      throw new BadRequestException('Invalid phone number format.');
    }
    const standardizedPhoneNumber = phoneNumber.format('E.164'); // e.g., +213512345678

    // 3. Check for phone number conflict
    const existingUserByPhone = await this.usersService.findByPhoneNumber(standardizedPhoneNumber);
    if (existingUserByPhone) {
        throw new ConflictException('A user with this phone number already exists.');
    }

    // 4. Hash the password
    const hashedPassword = await argon2.hash(registerUserDto.password);

    // 5. Create the new user
    const newUser = await this.usersService.create({
      fullname: registerUserDto.fullname,
      email: registerUserDto.email,
      hashedPassword: hashedPassword,
      phoneNumber: standardizedPhoneNumber,
      // `phoneVerified` is left as default (null)
    });
    
    // TODO: Trigger email verification flow
    // TODO (Alpha): Trigger phone verification flow
    
    return newUser;
  }
}
