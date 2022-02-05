import { seasonOptions } from '@/constants';
import { GetSemesterAndSonarrDataDocument } from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import {
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import ProForm, {
  ProFormDigit,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { useQuery } from '@apollo/client';
import { Button } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { useMemo } from 'react';

export default function BasicInfo() {
  const { data: optionsData } = useQuery(GetSemesterAndSonarrDataDocument);

  const sonarrOptions = useMemo((): DefaultOptionType[] => {
    const nodes = extractNode(optionsData?.allSonarrSeries);
    return (nodes ?? []).map(({ id, sonarrSlug, tvdbid }) => ({
      value: id,
      label: `${sonarrSlug} (tv${tvdbid})`,
    }));
  }, [optionsData]);

  return (
    <>
      <ProForm.Group>
        <ProFormText
          width="lg"
          name="uniformName"
          label="统一展示名称"
          required
          rules={[
            {
              required: true,
            },
          ]}
        />
        <ProFormFieldSet
          name="semester"
          label="首播季度"
          tooltip="1月新番属于新年度"
        >
          <ProFormDigit
            width="xs"
            fieldProps={{
              precision: 0,
            }}
          />
          <ProFormSelect
            options={seasonOptions}
            width="xs"
            fieldProps={{
              optionLabelProp: 'display',
            }}
          />
        </ProFormFieldSet>
      </ProForm.Group>
      <ProForm.Group
        title={
          <>
            关联信息{' '}
            <a
              href="https://std-4453.feishu.cn/wiki/wikcnAfVgNby6xDvHYuVWB3QT9b"
              target="_blank"
              rel="noreferrer"
              style={{
                fontWeight: 'normal',
              }}
            >
              <QuestionCircleOutlined /> 如何获取
            </a>
          </>
        }
      >
        <ProFormText width="sm" name="mikanAnimeId" label="mikanani.me季度ID" />
        <ProFormText width="sm" name="bangumiId" label="bangumi.tv季度ID" />
        <ProFormText
          width="sm"
          name="bilibiliMainlandSsid"
          label="B站大陆SSID"
        />
        <ProFormText width="sm" name="bilibiliThmSsid" label="B站港澳台SSID" />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="jellyfinSeasonId"
          label="Jellyfin季度ID"
          addonAfter={
            <Button>
              <SearchOutlined />
              搜索
            </Button>
          }
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormFieldSet name="sonarrInfo" label="Sonarr季度">
          <ProFormSelect width="lg" options={sonarrOptions} showSearch />
          <ProFormDigit
            addonBefore="S"
            width="xs"
            min={1}
            fieldProps={{
              precision: 0,
              formatter: (value) => `${value}`.padStart(2, '0'),
            }}
            addonAfter={
              <Button>
                <PlusOutlined />
                添加
              </Button>
            }
          />
        </ProFormFieldSet>
      </ProForm.Group>
    </>
  );
}
