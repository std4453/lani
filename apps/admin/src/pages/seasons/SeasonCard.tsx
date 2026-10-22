import { EPISODE_STATUS_TAGS } from '@/constants/download-status';
import { CardSeasonFieldsFragment } from '@/generated/types';
import { formatNumbering } from '@/utils/episode';
import { extractNode } from '@/utils/graphql';
import { Badge, Card } from 'antd';
import { useState } from 'react';
import { Link } from 'umi';
import {
  cardEpisodeStatus,
  episodeColor,
  episodeRows,
  selectEpisodeWindow,
} from './card-layout';
import styles from './SeasonCards.module.less';

export default function SeasonCard({
  season,
  openEpisode,
}: {
  season: CardSeasonFieldsFragment;
  openEpisode: (episodeId: number) => void;
}) {
  const source = season.poster?.downloadPath;
  const [failedSource, setFailedSource] = useState<string>();
  const episodes = selectEpisodeWindow(extractNode(season.mainEpisodes) ?? []);
  const rows = episodeRows(episodes);

  return (
    <Card
      hoverable
      role="article"
      className={styles.card}
      bodyStyle={{ padding: 0 }}
    >
      <div className={styles.poster}>
        <Link
          className={styles.posterLink}
          to={`/season/${season.id}`}
          aria-label={season.title}
        >
          {source && source !== failedSource ? (
            <img
              src={source}
              alt=""
              loading="lazy"
              onError={() => setFailedSource(source)}
            />
          ) : (
            <span className={styles.placeholder}>
              {source ? '封面加载失败' : '暂无封面'}
            </span>
          )}
          <span
            className={styles.monitoring}
            data-monitoring={season.isMonitoring}
          >
            <Badge
              status={season.isMonitoring ? 'success' : 'default'}
              text={season.isMonitoring ? '追番中' : '未追番'}
            />
          </span>
        </Link>
        {rows.length > 0 && (
          <div className={styles.episodes} aria-label="逐集状态">
            {rows.map((row, index) => (
              <div key={index} className={styles.episodeRow}>
                {row.map((episode) => {
                  const status = cardEpisodeStatus(episode);
                  const number = formatNumbering(episode.numbering);
                  const label = `${number} · ${episode.title} · ${EPISODE_STATUS_TAGS[status].children}`;
                  return (
                    <button
                      key={episode.id}
                      type="button"
                      className={styles.episodeButton}
                      data-tone={
                        episodeColor(status, season.isMonitoring) ?? 'gray'
                      }
                      data-fractional={number.includes('.')}
                      data-wide={number.replace('.', '').length > 2}
                      aria-label={label}
                      onClick={() => openEpisode(episode.id)}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <Link className={styles.seasonLink} to={`/season/${season.id}`}>
        <h3 className={styles.title} title={season.title}>
          {season.title}
        </h3>
      </Link>
    </Card>
  );
}
