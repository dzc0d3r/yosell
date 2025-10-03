import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';
import * as crypto from 'node:crypto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
    private readonly configService: ConfigService,
  ) {}

  async createEmailVerificationLink(userId: string, email: string) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.$transaction([
      // 1. Delete old tokens for this email
      this.prisma.verificationToken.deleteMany({ where: { identifier: email } }),
      // 2. Create the new token
      this.prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      }),
    ]);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    await this.messagingService.sendEmailVerification(email, verificationLink);
  }

  async verifyEmailToken(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new NotFoundException('Invalid or expired verification link.');
    }

    // Use a transaction to ensure atomicity: find user, update user, delete token
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: verificationToken.identifier },
      });

      if (!user) {
        // This case is unlikely but a good safeguard
        throw new NotFoundException('User associated with token not found.');
      }
      
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });

      await tx.verificationToken.delete({
        where: { token },
      });
    });

    return { message: 'Email successfully verified.' };
  }
}
