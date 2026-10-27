import {
  configureJellyfinClient,
  setJellyfinAxiosService,
} from '@/api/jellyfin';
import { LocalAxiosService } from '@/common/axios.service';
import config from '@/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InjectJellyfinAxiosService {
  constructor(local: LocalAxiosService) {
    configureJellyfinClient(config.jellyfin);
    setJellyfinAxiosService(local);
  }
}
