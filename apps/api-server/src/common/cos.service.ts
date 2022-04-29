import config from '@/config';
import { Injectable } from '@nestjs/common';
import COS from 'cos-nodejs-sdk-v5';

@Injectable()
export class COSService extends COS {
  constructor() {
    super({
      SecretId: config.cos.secretId,
      SecretKey: config.cos.secretKey,
    });
  }
}
