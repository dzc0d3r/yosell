import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Ip,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../prisma/generated/client';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('1. Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBody({ type: LoginUserDto })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user and receive session cookies' })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Session cookies are set. No user data is returned.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(
    @Body() _loginUserDto: LoginUserDto,
    @Req() req: FastifyRequest & { user: Omit<User, 'hashedPassword'> },
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
      userAgent,
      ip,
    );

    // Set secure HttpOnly cookies (logic remains the same)
    response.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') !== 'development',
      sameSite: 'strict',
      path: '/',
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });

    response.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') !== 'development',
      sameSite: 'strict',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { success: true, token: accessToken, message: 'Login successful.' };
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  getProfile(@Req() req: FastifyRequest & { user: any }) {
    return req.user;
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register/seller')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🟢 Register seller (Public)',
    description:
      'Creates a new seller account using email, password, phone number and send a verification email to verify the provided email',
  })
  @ApiResponse({
    status: 201,
    description: 'The seller account has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'A user with this email already exists.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data provided.' })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerSeller(registerUserDto);
  }

  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '🟠 Forgot password (Email)' })
  @ApiResponse({ status: 200, description: 'Acknowledges the request.' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '🔵 Reset password (Token Required)' })
  @ApiResponse({ status: 200, description: 'Password successfully reset.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
