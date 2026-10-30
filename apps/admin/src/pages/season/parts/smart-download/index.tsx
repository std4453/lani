import { useState } from 'react';
import { ThunderboltFilled } from '@ant-design/icons';
import { Button, Form, Modal } from 'antd';
import FormDependency from '@/components/FormDependency';
import { formItemProps, useSeasonPageContext } from '../../help';
import { describeSettings, DownloadSettings, settingNames } from './settings';
import { FIRST_USE_KEY, RULES_URL } from './constants';
import SettingsDialog from './SettingsDialog';
import styles from './index.module.less';

const PreservedValue = () => null;

export default function SmartDownload() {
  const { formRef, updateTouched } = useSeasonPageContext();
  const [draft, setDraft] = useState<DownloadSettings>();
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  const open = () => {
    const values = formRef.current?.getFieldsValue(
      settingNames,
    ) as DownloadSettings;
    if (!values) return;
    const settings = () => {
      setDraft({ ...values });
      setVisible(true);
    };
    let confirmed = false;
    try {
      confirmed = localStorage.getItem(FIRST_USE_KEY) === 'true';
    } catch {
      /* 浏览器禁用存储时仍允许配置。 */
    }
    if (!values.smartDownloadEnabled && !confirmed) {
      Modal.confirm({
        title: '开启智能下载',
        content: (
          <>
            <p>智能下载会根据库中的种子，自动匹配季度并下载。</p>
            <p>
              智能下载可能会出错，如果你发现匹配错误，可以通过{' '}
              <a href={RULES_URL} target="_blank" rel="noreferrer">
                规则集
              </a>{' '}
              配置屏蔽规则，或者去{' '}
              <a
                href="https://github.com/std4453/lani/issues"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>{' '}
              告诉我们。
            </p>
          </>
        ),
        okText: '确定',
        cancelText: '取消',
        onOk: settings,
      });
    } else settings();
  };
  return (
    <>
      {settingNames
        .filter((name) => name.startsWith('smartDownload'))
        .map((name) => (
          <Form.Item key={name} name={name} hidden>
            <PreservedValue />
          </Form.Item>
        ))}
      <div className={styles.band}>
        <FormDependency<DownloadSettings> name={settingNames}>
          {(values) => (
            <Form.Item
              label={
                <span className={styles.label}>
                  智能下载
                  <ThunderboltFilled className={styles.icon} aria-hidden />
                </span>
              }
              {...formItemProps}
            >
              <Button type="primary" className={styles.button} onClick={open}>
                {values.smartDownloadEnabled ? '设置…' : '开启智能下载'}
              </Button>
              {values.smartDownloadEnabled && (
                <div className={styles.summary}>{describeSettings(values)}</div>
              )}
            </Form.Item>
          )}
        </FormDependency>
      </div>
      {draft && (
        <SettingsDialog
          initial={draft}
          visible={visible}
          onCancel={close}
          afterClose={() => setDraft(undefined)}
          onSave={(value) => {
            formRef.current?.setFieldsValue(value);
            updateTouched();
            close();
          }}
        />
      )}
    </>
  );
}
