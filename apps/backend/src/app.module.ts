import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { MessagingModule } from './messaging/messaging.module';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [HealthModule, PrismaModule, UsersModule, AuthModule, ConfigModule, MessagingModule, VerificationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
