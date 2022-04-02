import { DownloadTorrentForEpisodeDocument } from '@/generated/types';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { message } from 'antd';

export default function ManualDownloadMagnetDialog({
  reject,
  resolve,
  visible,
  input,
}: DialogProps<{
  episodeId: number;
}>) {
  const client = useApolloClient();
  return (
    <ModalForm<{
      torrentLink: string;
    }>
      title="手动下载磁力链接"
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        onCancel: reject,
      }}
      autoFocusFirstInput
      onFinish={async ({ torrentLink }) => {
        try {
          await client.mutate({
            mutation: DownloadTorrentForEpisodeDocument,
            variables: {
              episodeId: input?.episodeId ?? 0,
              torrentLink,
            },
          });
          void message.success('下载任务创建成功');
          resolve();
          return true;
        } catch (e) {
          console.error(e);
          void message.error('下载任务创建成功');
          return false;
        }
      }}
    >
      <ProFormTextArea
        label="磁力链接地址"
        fieldProps={{
          autoSize: {
            minRows: 3,
          },
        }}
        name="torrentLink"
        required
        rules={[
          {
            required: true,
          },
        ]}
        placeholder="magnet:?xt=urn:btih:..."
      />
    </ModalForm>
  );
}

export const useManualDownloadMagnetDialog = createUseDialog(
  ManualDownloadMagnetDialog,
);
