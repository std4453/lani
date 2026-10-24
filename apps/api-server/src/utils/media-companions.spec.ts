import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { companions } from './media-companions';

describe('subtitle ownership', () => {
  let directory: string;
  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-companions-'));
  });
  afterEach(() => fs.rm(directory, { recursive: true, force: true }));
  const files = (...names: string[]) =>
    Promise.all(
      names.map((name) => fs.writeFile(path.join(directory, name), 'file')),
    );
  const find = (name: string) => companions(path.join(directory, name));

  it('assigns subtitles only to the longest matching video stem', async () => {
    await files('movie.mkv', 'movie.en.mkv', 'movie.en.srt', 'movie.zh.ass');
    await expect(find('movie.mkv')).resolves.toEqual([
      path.join(directory, 'movie.zh.ass'),
    ]);
    await expect(find('movie.en.mkv')).resolves.toEqual([
      path.join(directory, 'movie.en.srt'),
    ]);
  });

  it('skips ambiguous same-stem videos and unrelated subtitles', async () => {
    await files('movie.mkv', 'movie.mp4', 'movie.en.srt', 'other.ass');
    await expect(find('movie.mkv')).resolves.toEqual([]);
    await expect(find('movie.mp4')).resolves.toEqual([]);
    await expect(find('missing.mkv')).resolves.toEqual([]);
  });

  it('ignores directories and symbolic links when determining ownership', async () => {
    await files('movie.mkv', 'movie.en.srt');
    await fs.mkdir(path.join(directory, 'movie.en.mkv'));
    await fs.symlink(
      path.join(directory, 'movie.mkv'),
      path.join(directory, 'movie.en.mp4'),
    );
    await expect(find('movie.mkv')).resolves.toEqual([
      path.join(directory, 'movie.en.srt'),
    ]);
  });
});
