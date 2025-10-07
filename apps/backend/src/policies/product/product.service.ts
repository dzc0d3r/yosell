import { Injectable } from '@nestjs/common';
import { User, Product } from '../../prisma/generated/client';

@Injectable()
export class ProductPolicy {
  canUpdate(user: User, product: Product): boolean {
    return user.id === product.sellerId;
  }

  canDelete(user: User, product: Product): boolean {
    return user.id === product.sellerId;
  }
}
