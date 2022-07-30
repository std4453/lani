import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import fs from 'fs/promises';
import md5 from 'md5';
import pathModule from 'path';
import xml2js from 'xml2js';

export interface WriteFileIdempotentOptions {
  validateFile?: (content: Buffer) => boolean | Promise<boolean>;
  mkdir?: boolean;
}

export async function writeFileIdempotent(
  path: string,
  content: string | Buffer,
  { validateFile, mkdir = true }: WriteFileIdempotentOptions = {},
) {
  if (mkdir) {
    await fs.mkdir(pathModule.dirname(path), { recursive: true });
  }

  let currentFileHash = '';
  try {
    await fs.stat(path);
    const currentContent = await fs.readFile(path);
    if (validateFile) {
      const valid = await validateFile(currentContent);
      // 若文件无效，hash设置为空，即之后必定写入
      if (valid) {
        currentFileHash = md5(currentContent);
      }
    } else {
      currentFileHash = md5(currentContent);
    }
  } catch (error) {
    // 若文件不存在，xml格式有问题，无视报错，因为之后会覆盖它
    // 如果是没有读权限，或是目录，之后写入时肯定会报错，现在也可以无视
  }
  const newFileHash = await md5(content);
  if (currentFileHash !== newFileHash) {
    await fs.writeFile(path, content);
    return true;
  } else {
    return false;
  }
}

export interface WriteXMLFileIdempotentOptions {
  rootType: string;
  mkdir?: boolean;
}

const builder = new xml2js.Builder();
const parser = new xml2js.Parser();

export async function writeXMLFileIdempotent(
  path: string,
  content: any,
  { rootType, mkdir = true }: WriteXMLFileIdempotentOptions,
) {
  if (mkdir) {
    await fs.mkdir(pathModule.dirname(path), { recursive: true });
  }

  let xmlObj: any = {};
  let currentContent = '';
  try {
    await fs.stat(path);
    currentContent = await fs.readFile(path, 'utf8');
    xmlObj = await parser.parseStringPromise(currentContent);
  } catch (error) {
    // 若文件不存在，xml格式有问题，无视报错，因为之后会覆盖它
    // 如果是没有读权限，或是目录，之后写入时肯定会报错，现在也可以无视
  }
  ensureXMLRoot(xmlObj, rootType);
  mergeXMLNode(content, xmlObj[rootType]);
  const newContent = builder.buildObject(xmlObj);
  if (currentContent !== newContent) {
    await fs.writeFile(path, newContent, 'utf-8');
    return true;
  } else {
    return false;
  }
}

export async function removeDirectoryIdempotent(path: string) {
  try {
    await fs.stat(path);
    await fs.rm(path, { recursive: true });
    return true;
  } catch (error) {
    // 若文件不存在，返回未删除
    return false;
  }
}
