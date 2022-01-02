import {
  bilibiliBangumiCCService,
  BilibiliBangumiCCService,
  tDownloadSRTRequest,
  tDownloadSRTResponse,
} from "@lani/api/dist/services/bilibiliBangumiCC";
import {
  buildApp,
  buildRoute as r,
  NormalError,
  startApp,
} from "@lani/framework";
import axios from "axios";
import { isLeft } from "fp-ts/lib/Either";
import * as t from "io-ts";

async function getCID(epid: string): Promise<number> {
  const {
    data: { code, message, result },
  } = await axios({
    url: `https://api.bilibili.com/pgc/view/web/season?ep_id=${epid}`,
    method: "GET",
  });
  if (code === -404) {
    throw new NormalError(404, "Season Not Found");
  } else if (code !== 0) {
    throw new NormalError(code, message);
  }

  const episodes = (result?.episodes ?? []) as {
    cid: number;
    id: number;
  }[];
  const episode = episodes.find(({ id }) => `${id}` === epid);
  if (!episode) {
    throw new NormalError(404, "Episode Not Found");
  }

  return episode.cid;
}

async function getSubtitleURL(cid: number, language: string): Promise<string> {
  const {
    data: { code, message, data: result },
  } = await axios({
    url: `https://api.bilibili.com/x/v2/dm/view?oid=${cid}&type=1`,
    method: "GET",
  });
  if (code === -404) {
    throw new NormalError(404, "Video Not Found");
  } else if (code !== 0) {
    throw new NormalError(code, message);
  }

  const subtitles = result?.subtitle?.subtitles;
  if (!subtitles) {
    throw new NormalError(404, "Subtitle Not Found");
  }
  const url = (
    subtitles as {
      lan;
      subtitle_url;
    }[]
  ).find(({ lan }) => lan === language)?.subtitle_url;
  if (!url) {
    throw new NormalError(404, "Subtitle with Language Not Found");
  }

  return url;
}

const tCCJSON = t.type({
  body: t.array(
    t.type({
      content: t.string,
      from: t.number,
      location: t.number,
      to: t.number,
    })
  ),
});

type CCJSON = t.TypeOf<typeof tCCJSON>;

async function getCCJson(url: string): Promise<CCJSON> {
  // TODO: SSRF!
  const { data: ccJSON } = await axios({
    url,
    method: "GET",
  });
  const decoded = tCCJSON.decode(ccJSON);
  if (isLeft(decoded)) {
    throw new NormalError(500, "Invalid CC JSON");
  }
  return decoded.right;
}

function pad(n: number, width) {
  return `${n}`.padStart(width, "0");
}

function srtftime(time: number): string {
  const sec = Math.floor(time % 60);
  const min = Math.floor((time / 60) % 60);
  const hrs = Math.floor(time / 60 / 60);
  const ms = Math.floor((time - Math.floor(time)) * 1000);
  return `${pad(hrs, 2)}:${pad(min, 2)}:${pad(sec, 2)},${pad(ms, 3)}`;
}

function toSRTText(ccJSON: CCJSON): string {
  return ccJSON.body
    .map(({ from, to, content }, index) => {
      return [
        `${index + 1}`,
        `${srtftime(from)} ->> ${srtftime(to)}`,
        content,
        "",
        "",
      ].join("\n");
    })
    .join("");
}

const app = buildApp<BilibiliBangumiCCService>({
  "/downloadSRT": r(
    tDownloadSRTRequest,
    tDownloadSRTResponse,
    async ({ epid, language }) => {
      const cid = await getCID(epid);
      const url = await getSubtitleURL(cid, language);
      const ccJSON = await getCCJson(url);
      const srtText = toSRTText(ccJSON);
      return {
        srtText,
      };
    }
  ),
});

startApp(app, bilibiliBangumiCCService);
