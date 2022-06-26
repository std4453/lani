import { CreateSeasonDocument } from '@/generated/types';
import { useJellyfinFolders } from '@/pages/seasons/useJellyfinFolders';
import { useAsyncButton } from '@/utils/useAsyncButton';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import useMobile from '@/utils/useMobile';
import { useApolloClient } from '@apollo/client';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import { useState } from 'react';

export default function CreateSeasonDialog({
  visible,
  reject,
  resolve,
}: DialogProps<void, { id: number }>) {
  const client = useApolloClient();

  const [title, setTitle] = useState('');

  const { folderId, foldersSelectProps } = useJellyfinFolders(visible);

  const disabled = !title || !folderId;

  const mobile = useMobile();

  const okButtonProps = useAsyncButton(async () => {
    if (disabled) {
      return;
    }
    try {
      const { data } = await client.mutate({
        mutation: CreateSeasonDocument,
        variables: {
          season: {
            title,
            jellyfinFolderId: folderId,
          },
        },
      });
      const id = data?.createSeason?.season?.id;
      if (!id) {
        throw new Error('no id');
      }
      void message.success('新建成功');
      void resolve({ id });
    } catch (e) {
      console.error(e);
      void message.error('新建失败');
    }
  });

  return (
    <Modal
      title="新建季度"
      visible={visible}
      destroyOnClose={true}
      onCancel={reject}
      footer={[
        <Space direction="horizontal" size={8} wrap key="actions">
          <Select
            {...foldersSelectProps}
            style={{
              width: 200,
              textAlign: 'left',
            }}
          />
          <Space direction="horizontal" size={8}>
            <Button onClick={reject}>取消</Button>
            <Button disabled={disabled} {...okButtonProps} type="primary">
              添加
            </Button>
          </Space>
        </Space>,
      ]}
    >
      <Form layout={mobile ? 'vertical' : 'horizontal'}>
        <Form.Item label="标题" tooltip="可修改，不能和其他季度重名" required>
          <Input
            placeholder="请输入标题"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export const useCreateSeasonDialog = createUseDialog(CreateSeasonDialog);
