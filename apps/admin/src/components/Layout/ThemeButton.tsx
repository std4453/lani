import { useTheme } from '@/theme';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import styles from './index.module.less';

const labels = { light: '亮色', dark: '暗色', system: '遵循系统' };

function SystemThemeIcon() {
  return (
    <span className={styles.systemThemeIcon} aria-hidden="true">
      <SunOutlined className={styles.sunHalf} />
      <MoonOutlined className={styles.moonHalf} />
    </span>
  );
}

const icons = {
  light: SunOutlined,
  dark: MoonOutlined,
  system: SystemThemeIcon,
};

export default function ThemeButton() {
  const { mode, cycle } = useTheme();
  const Icon = icons[mode];
  const label = labels[mode];
  return (
    <Tooltip title={label}>
      <Button type="text" icon={<Icon />} onClick={cycle} aria-label={label} />
    </Tooltip>
  );
}
