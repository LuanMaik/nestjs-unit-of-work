import { Module } from '@nestjs/common';
import { UnitOfWorkService } from './services/unit-of-work.service';

@Module({
  imports: [],
  controllers: [],
  providers: [UnitOfWorkService],
  exports: [UnitOfWorkService],
})
export class CoreModule {}
