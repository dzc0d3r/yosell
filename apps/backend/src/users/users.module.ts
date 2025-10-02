import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module'; // <-- CRITICAL: Import PrismaModule here

@Module({
  imports: [PrismaModule], // <-- Add it to the imports array
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
