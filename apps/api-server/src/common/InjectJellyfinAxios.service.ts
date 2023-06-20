import { setJellyfinAxiosService } from '@/api/jellyfin';
import { LocalAxiosService } from '@/common/axios.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InjectJellyfinAxiosService {
  constructor(local: LocalAxiosService) {
    setJellyfinAxiosService(local);
  }
}
