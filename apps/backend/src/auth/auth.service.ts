import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as argon2 from 'argon2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { VerificationService } from '../verification/verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from '../messaging/messaging.service';

@Injectable()
export class AuthService {
    constructor(
               private readonly usersService: UsersService,
               private readonly verificationService: VerificationService,
               private readonly prisma: PrismaService, // Inject Prisma for direct access
               private readonly configService: ConfigService,
               private readonly messagingService: MessagingService,
                ) {}

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
    await this.verificationService.createEmailVerificationLink(
      newUser.id,
      newUser.email,
    );
    // TODO (Alpha): Trigger phone verification flow
    
    return newUser;
  }

  /* Password reset */
  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(email);

    // SECURITY: Always return a success-like response to prevent user enumeration.
    if (!user) {
      return { message: 'If a user with that email exists, a password reset link has been sent.' };
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minute expiry

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({ where: { identifier: email } }),
      this.prisma.passwordResetToken.create({
        data: { identifier: email, token, expires },
      }),
    ]);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.messagingService.sendPasswordResetEmail(email, resetLink);
    
    return { message: 'If a user with that email exists, a password reset link has been sent.' };
  }

  // --- NEW METHOD 2: RESET THE PASSWORD ---
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset link.');
    }

    const hashedPassword = await argon2.hash(newPassword);

    // Atomic transaction: find user, update password, delete token
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: resetToken.identifier },
        data: { hashedPassword: hashedPassword },
      });

      // SECURITY: Consume the token immediately after use.
      await tx.passwordResetToken.delete({
        where: { token },
      });
    });
    
    // TODO (Future): Invalidate all existing refresh tokens/sessions for this user.

    return { message: 'Your password has been successfully reset.' };
  }
}
