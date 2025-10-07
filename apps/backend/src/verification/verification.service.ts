import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';
import { generateSecureToken, hashToken } from '../utils/token.utils';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
    private readonly configService: ConfigService,
  ) {}

  async createEmailVerificationLink(userId: string, email: string) {
    // [UPDATED] Use our secure generator
    const { rawToken, hashedToken } = generateSecureToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.$transaction([
      this.prisma.verificationToken.deleteMany({
        where: { identifier: email },
      }),
      this.prisma.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken, // [UPDATED] Store the HASH, not the raw token
          expires,
        },
      }),
    ]);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    // [UPDATED] Send the RAW token in the link
    const verificationLink = `${frontendUrl}/verify-email?token=${rawToken}`;

    await this.messagingService.sendEmailVerification(email, verificationLink);
  }
  async verifyEmailToken(rawToken: string) {
    // [UPDATED] Hash the incoming raw token to find it in the database
    const hashedToken = hashToken(rawToken);

    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token: hashedToken }, // [UPDATED] Query by the hash
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new NotFoundException('Invalid or expired verification link.');
    }

    // The rest of the transaction logic remains the same, but it's more secure
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: verificationToken.identifier },
      });
      if (!user) throw new NotFoundException('User not found.');

      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });

      await tx.verificationToken.delete({ where: { token: hashedToken } }); // [UPDATED] Delete by the hash
    });

    return { message: 'Email successfully verified.' };
  }
}
