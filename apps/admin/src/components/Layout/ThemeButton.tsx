import { useTheme } from '@/theme';
import { nextThemeMode } from '@/theme/settings';
import { BulbOutlined, DesktopOutlined, BulbFilled } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const labels = { light: '亮', dark: '暗', system: '系统' };
const icons = {
  light: BulbOutlined,
  dark: BulbFilled,
  system: DesktopOutlined,
};

export default function ThemeButton({
  showLabel = false,
}: {
  showLabel?: boolean;
}) {
  const { mode, cycle } = useTheme();
  const Icon = icons[mode];
  const label = `主题：${labels[mode]}；切换到${labels[nextThemeMode(mode)]}`;
  return (
    <Tooltip title={label}>
      <Button type="text" icon={<Icon />} onClick={cycle} aria-label={label}>
        {showLabel ? `主题：${labels[mode]}` : null}
      </Button>
    </Tooltip>
  );
}
