import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // <-- Import the UsersModule
import { VerificationModule } from '../verification/verification.module'; // <-- IMPORT
@Module({
  imports: [UsersModule, VerificationModule], // <-- Add it to the imports array
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
