import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerUserDto: RegisterUserDto) {
    // 1. Check if a user with this email already exists
    const existingUser = await this.usersService.findByEmail(
      registerUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    // 2. Hash the password using Argon2
    const hashedPassword = await argon2.hash(registerUserDto.password);

    // 3. Create the new user by calling the UsersService
    const newUser = await this.usersService.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      hashedPassword: hashedPassword,
    });
    
    // 4. TODO: Trigger the email verification flow here in a future step

    // 5. Return the newly created user (without the password)
    return newUser;
  }
}
