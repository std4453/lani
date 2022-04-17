export interface LarkPostText {
  tag: 'text';
  text: string;
  un_escape?: boolean;
}

export interface LarkPostA {
  tag: 'a';
  text: string;
  href: string;
}

export interface LarkPostAt {
  tag: 'at';
  user_id: string;
  user_name?: string;
}

export interface LarkPostImg {
  tag: 'img';
  image_key: string;
  height?: number;
  width?: number;
}

export type LarkPostTag = LarkPostText | LarkPostA | LarkPostAt | LarkPostImg;

export interface LarkPostLanguage {
  title?: string;
  content: LarkPostTag[][];
}

export type LarkPost = {
  [language in string]: LarkPostLanguage;
};

export type LarkCard = any;

// TODO: 类型
export interface LarkMessage {
  msg_type: string;
  content: any;
}

export type LarkReceiveIDType =
  | 'open_id'
  | 'user_id'
  | 'union_id'
  | 'email'
  | 'chat_id';

export function buildTextMessage(message: string): LarkMessage {
  return {
    msg_type: 'text',
    content: {
      text: message,
    },
  };
}

export function buildPostMessage(content: LarkPostLanguage): LarkMessage {
  return {
    msg_type: 'post',
    content: {
      zh_cn: content,
    } as LarkPost,
  };
}

export function buildCardMessage(content: LarkCard): LarkMessage {
  return {
    msg_type: 'interactive',
    content,
  };
}
