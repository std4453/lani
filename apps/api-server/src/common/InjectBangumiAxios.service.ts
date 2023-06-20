import { setBangumiAxiosInstance } from '@/api/bangumi';
import { GlobalAxiosService } from '@/common/axios.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InjectBangumiAxiosService {
  constructor(global: GlobalAxiosService) {
    setBangumiAxiosInstance(global);
  }
}
