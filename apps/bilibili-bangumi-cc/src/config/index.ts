const config = {
  cosSecretId: process.env.COS_SECRET_ID,
  cosSecretKey: process.env.COS_SECRET_KEY,
  cosBucket: process.env.COS_BUCKET,
  cosRegion: process.env.COS_REGION,
} as const;

export default config;
