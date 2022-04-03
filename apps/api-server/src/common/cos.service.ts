import { ConfigType } from '@/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS from 'cos-nodejs-sdk-v5';

@Injectable()
export class COSService extends COS {
  constructor(config: ConfigService<ConfigType, true>) {
    super({
      SecretId: config.get('cosSecretId'),
      SecretKey: config.get('cosSecretKey'),
    });
  }
}
