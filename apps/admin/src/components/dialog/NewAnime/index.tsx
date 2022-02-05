import { useSingletonDialog } from '@/components/dialog';
import { NewAnimeDocument } from '@/generated/types';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { message } from 'antd';

export default function NewAnime() {
  const { visible, resolve, reject } = useSingletonDialog('NewAnime');
  const client = useApolloClient();
  return (
    <ModalForm<{
      uniformName: string;
    }>
      title="新建元数据"
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        onCancel: reject,
      }}
      onFinish={async ({ uniformName }) => {
        try {
          const { data } = await client.mutate({
            mutation: NewAnimeDocument,
            variables: {
              uniformName,
            },
          });
          const id = data?.createAnimeMetadatum?.animeMetadatum?.id;
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
        label="统一展示名称"
        name="uniformName"
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
