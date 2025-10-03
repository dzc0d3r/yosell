import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Module({
  providers: [MessagingService],
  exports: [MessagingService], // Export the service for other modules to use
})
export class MessagingModule {}
