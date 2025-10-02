import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export the service so other modules can import this module and use it
})
export class PrismaModule {} // NO @Global() decorator
