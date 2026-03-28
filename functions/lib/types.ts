export interface Env {
  DB: D1Database
  VIDEOS: R2Bucket
  JWT_SECRET: string
  ASAAS_API_KEY: string
  ADMIN_EMAIL: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_ENDPOINT: string   // https://37f46dbeaab9c3be96f3a111d9796161.r2.cloudflarestorage.com
  R2_BUCKET: string     // dramix-videos
}
