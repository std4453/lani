import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { string } from 'fp-ts';
import createHttpsProxyAgent from 'https-proxy-agent';
import { ConfigType } from 'src/config';

@Injectable()
export class CommonService {
  constructor(private configService: ConfigService<ConfigType>) {}

  hk1Agent = createHttpsProxyAgent(this.configService.get<string>('proxy'));
}

@Module({
  imports: [ConfigModule],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
