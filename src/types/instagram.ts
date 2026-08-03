export type MediaType = 'REEL' | 'CAROUSEL' | 'IMAGE' | 'STORY'

export interface Post {
  id: number
  type: MediaType
  date: string
  caption: string
  topic: string
  reach: number
  impressions: number | null
  likes: number
  comments: number
  shares: number
  saves: number
  views: number | null
  avgWatchTimeSec: number | null
  engagementRate: number
  isCollaboration: boolean
  creatorFollowers?: number
  advLikes?: number
  advComments?: number
  advShares?: number
  advSaves?: number
}

export interface Story {
  id: number
  date: string
  caption: string
  reach: number
  impressions: number
  exits: number
  replies: number
  tapsForward: number
  tapsBack: number
  linkClicks: number | null
  completionRate: number
}

export interface MonthlySnapshot {
  month: string
  label: string
  followersEnd: number
  followersGained: number
  followersLost: number
  totalReach: number
  totalImpressions: number
  avgEngagementRate: number
  postsPublished: number
  reelsPublished: number
  storiesPublished: number
  carouselsPublished: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalSaves: number
}

export interface AutoInsight {
  id: string
  category: 'top' | 'warning' | 'trend' | 'opportunity' | 'recommendation'
  icon: string
  title: string
  body: string
  metric?: string
}
