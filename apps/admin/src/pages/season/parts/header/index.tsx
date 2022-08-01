import { GetSeasonByTitleDocument } from '@/generated/types';
import { useAsyncButton } from '@/utils/useAsyncButton';
import { useDialog } from '@/utils/useDialog';
import useMobile from '@/utils/useMobile';
import { ProFormText } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { Button, message, Modal, PageHeader, Space } from 'antd';
import { ForwardedRef, forwardRef } from 'react';
import { useHistory } from 'umi';
import { useSeasonPageContext } from '../../help';
import styles from './index.module.less';

const Header = forwardRef((_props, ref: ForwardedRef<HTMLDivElement>) => {
  const { formRef, id, syncMetadataAndEpisodes, modified } =
    useSeasonPageContext();

  const client = useApolloClient();
  const history = useHistory();
  const {
    resolve: resolveDiscard,
    reject: rejectDiscard,
    visible: discardVisible,
    openNoThrow: openDiscard,
  } = useDialog();
  const {
    resolve: resolveSave,
    reject: rejectSave,
    visible: saveVisible,
    openNoThrow: openSave,
    input: saveInput,
  } = useDialog<{ type: string }>();

  const syncMetadataProps = useAsyncButton(async () => {
    if (!formRef.current) {
      return;
    }
    if (modified) {
      void message.info('有未保存的修改，请先保存再同步');
      return;
    }
    await syncMetadataAndEpisodes();
  });

  const mobile = useMobile();

  return (
    <>
      <PageHeader
        title={
          <Space direction="horizontal" className={styles.space}>
            <ProFormText
              width={mobile ? 'sm' : 'lg'}
              name="title"
              rules={[
                {
                  required: true,
                  message: '请输入季度标题',
                },
                {
                  validator: async (_, value) => {
                    const { data } = await client.query({
                      query: GetSeasonByTitleDocument,
                      variables: {
                        title: value,
                      },
                    });
                    if (
                      data?.seasonByTitle?.id &&
                      data?.seasonByTitle?.id !== id
                    ) {
                      throw new Error('存在同名季度');
                    }
                  },
                },
              ]}
              placeholder="标题"
              formItemProps={{
                style: {
                  marginTop: 24,
                },
              }}
            />
          </Space>
        }
        onBack={async () => {
          if (modified) {
            const { type } = await openDiscard();
            if (type !== 'success') {
              return;
            }
          }
          // 无历史记录时回到季度列表页
          if (history.length <= 1) {
            history.replace('/seasons');
          } else {
            history.goBack();
          }
        }}
        extra={
          <div className={styles.extra}>
            <Button type="primary" ghost {...syncMetadataProps}>
              同步元数据
            </Button>
            <div ref={ref} className={styles.submitter} />
          </div>
        }
        className={styles.root}
      />
      <Modal
        title="确认返回"
        visible={discardVisible}
        onOk={() => resolveDiscard()}
        onCancel={rejectDiscard}
      >
        有尚未保存的修改，丢弃修改并返回上一页？
      </Modal>
      <Modal
        title="保存数据"
        visible={saveVisible}
        onOk={() => resolveSave()}
        onCancel={rejectSave}
      >
        有尚未保存的修改，未保存的数据无法用于{saveInput?.type}，保存并
        {saveInput?.type}？
      </Modal>
    </>
  );
});

export default Header;
