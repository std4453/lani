import { formItemProps } from '@/pages/season/help';
import Section from '@/pages/season/Section';
import { ProFormSwitch } from '@ant-design/pro-form';

export default function Notifications() {
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
    </Section>
  );
}
