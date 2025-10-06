import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // <-- Import the UsersModule
import { VerificationModule } from '../verification/verification.module'; // <-- IMPORT
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';
@Module({
  imports: [UsersModule, VerificationModule, PrismaModule, MessagingModule], // <-- Add it to the imports array
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
