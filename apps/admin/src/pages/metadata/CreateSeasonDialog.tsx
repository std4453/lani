import { CreateSeasonDocument } from '@/generated/types';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { message } from 'antd';

export default function CreateSeasonDialog({
  visible,
  reject,
  resolve,
}: DialogProps<void, { id: number }>) {
  const client = useApolloClient();
  return (
    <ModalForm<{
      title: string;
    }>
      title="新建季度"
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        onCancel: reject,
      }}
      autoFocusFirstInput
      onFinish={async ({ title }) => {
        try {
          const { data } = await client.mutate({
            mutation: CreateSeasonDocument,
            variables: {
              season: {
                title,
              },
            },
          });
          const id = data?.createSeason?.season?.id;
          if (!id) {
            throw new Error('no id');
          }
          void message.success('新建成功');
          resolve({ id });
          return true;
        } catch (e) {
          console.error(e);
          void message.error('新建失败');
          return false;
        }
      }}
    >
      <ProFormText
        width="lg"
        label="标题"
        tooltip="可以随时修改，不能和其他季度重名"
        name="title"
        required
        rules={[
          {
            required: true,
          },
        ]}
      />
    </ModalForm>
  );
}

export const useCreateSeasonDialog = createUseDialog(CreateSeasonDialog);
