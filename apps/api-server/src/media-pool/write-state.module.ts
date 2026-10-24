import { Global, Module } from '@nestjs/common';
import { MediaWriteState } from './write-state';

@Global()
@Module({ providers: [MediaWriteState], exports: [MediaWriteState] })
export class MediaWriteStateModule {}
