import { Module } from '@nestjs/common';
import { ProductPolicy } from './product/product.service';

@Module({
  providers: [ProductPolicy],
  exports: [ProductPolicy],
})
export class PoliciesModule {}
