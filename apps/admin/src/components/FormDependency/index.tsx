import {
  ProFormDependency,
  ProFormDependencyProps,
} from '@ant-design/pro-form';
import { FormInstance } from 'antd';

export default function FormDependency<Values>({
  children,
  ...props
}: Omit<ProFormDependencyProps, 'children'> & {
  children: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: Values,
    form: FormInstance<Values>,
  ) => React.ReactNode;
}) {
  return (
    <ProFormDependency {...props}>
      {children as ProFormDependencyProps['children']}
    </ProFormDependency>
  );
}
