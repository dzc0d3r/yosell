// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../prisma/generated/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  async findByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  async createSeller(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: {
        ...data,
        roles: {
          connect: { name: 'SELLER' },
        },
      },
      select: {
        // Ensure we return all new fields
        id: true,
        fullname: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        phoneVerified: false,
      },
    });
  }
}
