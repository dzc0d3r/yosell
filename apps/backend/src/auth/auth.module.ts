import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // <-- Import the UsersModule

@Module({
  imports: [UsersModule], // <-- Add it to the imports array
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
