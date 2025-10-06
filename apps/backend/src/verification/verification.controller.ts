import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('1. Authentication')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '🔵 Verify an email address (Token Required)'})
  @ApiResponse({ status: 200, description: 'Email successfully verified.' })
  @ApiResponse({ status: 404, description: 'Invalid or expired verification link.' })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.verificationService.verifyEmailToken(verifyEmailDto.token);
  }
}
