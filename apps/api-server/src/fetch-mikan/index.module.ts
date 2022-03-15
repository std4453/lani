import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/index.module';
import { FetchMikanResolver } from 'src/fetch-mikan/index.resolver';
import { FetchMikanService } from 'src/fetch-mikan/index.service';

@Module({
  imports: [CommonModule],
  providers: [FetchMikanService, FetchMikanResolver],
})
export class FetchMikanModule {}
