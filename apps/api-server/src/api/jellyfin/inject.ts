import { Axios } from 'axios';

let axiosInstance: Axios | null = null;

export function getJellyfinAxiosSerivce() {
  if (axiosInstance) return axiosInstance;
  throw new Error('Axios Instance not injected yet!');
}

export function setJellyfinAxiosService(axios: Axios) {
  axiosInstance = axios;
}
