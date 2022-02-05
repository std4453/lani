import DownloadConfig from '@/components/dialog/DownloadConfig';
import NewAnime from '@/components/dialog/NewAnime';
import createDialogManager from './manager';

const { DialogProvider, useDialog, useOpenDialog, useSingletonDialog } =
  createDialogManager<{
    NewAnime: {
      request: void;
      response: {
        id: number;
      };
    };
    DownloadConfig: {
      request: { animeId: number } & (
        | {
            type: 'edit';
            id: number;
          }
        | {
            type: 'create';
          }
      );
      response: void;
    };
  }>({
    NewAnime: {
      component: NewAnime,
      singleton: true,
    },
    DownloadConfig: {
      component: DownloadConfig,
      singleton: true,
    },
  });

export { DialogProvider, useDialog, useOpenDialog, useSingletonDialog };
