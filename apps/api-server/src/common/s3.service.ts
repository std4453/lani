import config from '@/config';
import { Injectable, Provider } from '@nestjs/common';
import AWS from 'aws-sdk';

@Injectable()
export class S3Service extends AWS.S3 {
  constructor() {
    super(config.s3);
  }
}

export const S3ServiceProvider: Provider = {
  provide: S3Service,
  useFactory: () => new AWS.S3(config.s3),
};
