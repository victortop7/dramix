export interface Env {
  DB: D1Database
  VIDEOS: R2Bucket
  JWT_SECRET: string
  SYNCPAY_SECRET_KEY: string
  SYNCPAY_WEBHOOK_SECRET: string
  ADMIN_EMAIL: string
}
