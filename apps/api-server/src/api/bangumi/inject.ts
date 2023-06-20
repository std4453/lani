import { Axios } from 'axios';

let axiosInstance: Axios | null = null;

export function getBangumiAxiosInstance() {
  if (axiosInstance) return axiosInstance;
  throw new Error('Axios Instance not injected yet!');
}

export function setBangumiAxiosInstance(axios: Axios) {
  axiosInstance = axios;
}
