import { selectConfig } from '@/store/config';
import { ProFormSwitch } from '@ant-design/pro-form';
import { useSelector } from 'react-redux';
import Section from '../../components/section';
import { formItemProps } from '../../help';

export default function Notifications() {
  const config = useSelector(selectConfig);

  return (
    <Section title="通知设置">
      <ProFormSwitch
        label="缺集告警"
        name="notifyMissing"
        formItemProps={formItemProps}
      />
      <ProFormSwitch
        label="更新通知"
        name="notifyPublish"
        formItemProps={formItemProps}
      />
      {config?.features.lania && (
        <ProFormSwitch
          label="同步到 Lania"
          name="integrationsLaniaSync"
          formItemProps={formItemProps}
        />
      )}
    </Section>
  );
}
