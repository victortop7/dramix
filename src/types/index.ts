export interface User {
  id: string
  name: string
  email: string
  whatsapp?: string
  plan: 'free' | 'basic' | 'premium'
  planExpiresAt?: string
  isAdmin: boolean
  createdAt: string
}

export interface Profile {
  id: string
  userId: string
  name: string
  avatar: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  sortOrder: number
}

export interface Drama {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  videoUrl?: string
  durationSeconds?: number
  isDubbed: boolean
  isNew: boolean
  isExclusive: boolean
  rating: number
  views: number
  categories: Category[]
  createdAt: string
}

export interface DramaWithProgress extends Drama {
  progressSeconds?: number
}

export interface FeaturedDrama extends Drama {
  tags?: string[]
}

export interface CategoryWithDramas {
  id: string
  name: string
  slug: string
  sortOrder: number
  dramas: Drama[]
}

export interface Subscription {
  id: string
  userId: string
  plan: 'basic' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  syncpayId?: string
  amountCents: number
  startsAt: string
  expiresAt?: string
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  token: string | null
  isLoading: boolean
}

export type PlanType = 'free' | 'basic' | 'premium'
