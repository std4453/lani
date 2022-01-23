import { Layout, Menu } from "antd";
import { useState } from "react";
import { DatabaseOutlined } from "@ant-design/icons";
import "antd/dist/antd.less";
import styles from "./app.module.less";
import clsx from "clsx";

export default function MyApp({ Component, pageProps }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Layout.Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(collapsed) => {
          setCollapsed(collapsed);
        }}
      >
        <div className={styles.logoContainer}>
          <div
            className={clsx(styles.logoBlock, {
              [styles.collapsed]: collapsed,
            })}
          >
            <img src="/lani-text.svg" alt="Lani" className={styles.logo} />
          </div>
        </div>
        <Menu theme="light" mode="inline">
          <Menu.Item key="metadata" icon={<DatabaseOutlined />}>
            元数据
          </Menu.Item>
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header className={styles.header}></Layout.Header>
        <Layout.Content className={styles.content}>
          <Component {...pageProps} />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
