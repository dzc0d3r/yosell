import {
  ExtractJwt,
  Strategy,
  type JwtFromRequestFunction,
} from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../prisma/generated/client';

export interface JwtPayload {
  sub: string;
  sid: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Ensure secret is present before calling super()
    const accessSecret = configService.get<string | undefined>(
      'JWT_ACCESS_SECRET',
    );
    if (!accessSecret) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET is not defined. Set JWT_ACCESS_SECRET in your env.',
      );
    }

    // Explicitly type the extractor as JwtFromRequestFunction to satisfy passport-jwt typings
    const cookieExtractor: JwtFromRequestFunction = (
      req: any,
    ): string | null => {
      // Use `any` here because FastifyRequest/Express Request shapes differ in typings.
      // At runtime, @fastify/cookie must be registered so req.cookies exists.
      try {
        return req?.cookies?.access_token ?? null;
      } catch {
        return null;
      }
    };

    // Fallback to Authorization header if cookie is not present
    const headerExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        headerExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
      // passReqToCallback: false, // not required here
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<User, 'hashedPassword'>> {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
    });
    if (!session) {
      throw new UnauthorizedException('Session not found or has been revoked.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException(
        'User associated with this token not found.',
      );
    }

    const { hashedPassword, ...result } = user;
    return result;
  }
}
