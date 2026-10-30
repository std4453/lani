import {
  Alert,
  Form,
  FormInstance,
  InputNumber,
  Select,
  Space,
  Switch,
} from 'antd';
import { DownloadSettings, subtitleLabels } from './settings';
import OffsetInput from './OffsetInput';
import styles from './index.module.less';

export default function SettingsForm({
  form,
  initial,
  mode,
  onValuesChange,
}: {
  form: FormInstance<DownloadSettings>;
  initial: DownloadSettings;
  mode?: string | null;
  onValuesChange(values: DownloadSettings): void;
}) {
  return (
    <Form
      form={form}
      initialValues={initial}
      layout="horizontal"
      colon={false}
      requiredMark={false}
      className={styles.settings}
      onValuesChange={(_, values) => onValuesChange(values)}
    >
      {mode === 'lexical' && (
        <Alert
          className={styles.matcherWarning}
          type="warning"
          showIcon
          message="使用词法模式时的识别准确率可能较低，不建议开启智能下载"
        />
      )}
      <div className={styles.grid}>
        <Form.Item
          label="字幕要求"
          name="smartDownloadSubtitle"
          rules={[{ required: true, message: '请选择字幕要求' }]}
        >
          <Select
            options={Object.entries(subtitleLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Baha 优先"
          name="smartDownloadPreferBaha"
          valuePropName="checked"
          tooltip="自动取消其他下载中任务，下载 Baha 源的种子，已完成下载的不替换"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="下载窗口"
          name="smartDownloadWindowHours"
          tooltip="为避免晚发布的剧集被误下载，超出剧集发布后一定时间的种子将被忽略"
          rules={[
            {
              required: true,
              type: 'integer',
              min: 1,
              max: 168,
              message: '请输入 1 至 168 小时',
            },
          ]}
        >
          <InputNumber min={1} max={168} precision={0} addonAfter="小时" />
        </Form.Item>
        <Form.Item
          label="下载超时"
          name="smartDownloadTimeoutMinutes"
          tooltip="超时后会自动取消原任务，可继续智能下载"
          rules={[{ type: 'integer', min: 0, message: '请输入非负整数或留空' }]}
        >
          <InputNumber
            min={0}
            precision={0}
            placeholder="不限制"
            addonAfter="分钟"
          />
        </Form.Item>
        <Form.Item label="下载时间" className={styles.downloadTime}>
          <span className={styles.timeOffsetLabel}>基于剧集放送时间，</span>
          <Space wrap>
            <Form.Item name="downloadOffsetType" noStyle>
              <Select
                style={{ width: 84 }}
                options={[
                  { value: 'advance', label: '提前' },
                  { value: 'postpone', label: '延后' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="downloadOffsetDays"
              noStyle
              rules={[{ required: true, type: 'integer', min: 0, max: 14 }]}
            >
              <OffsetInput label="下载偏移天数" />
            </Form.Item>
            天
            <Form.Item
              name="downloadOffsetHours"
              noStyle
              rules={[{ required: true, type: 'integer', min: 0, max: 24 }]}
            >
              <OffsetInput label="下载偏移小时数" />
            </Form.Item>
            小时开始下载
          </Space>
        </Form.Item>
      </div>
    </Form>
  );
}
