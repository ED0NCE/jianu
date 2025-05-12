export interface ApiResponse {
  data: {
    list: WaterfallCardProps[]
    total: number
  }
  status: number
  message: string
}
export interface WaterfallCardProps {
  /** 顶部小标签，比如 "日本"、"希腊" */
  tag?: string
  /** 游记ID */
  travel_id?: string
  /** 卡片图片 */
  images: string[]
  /** 标题 */
  title: string
  /** 天数 */
  days?: number
  /** 人数 */
  participants?: number
  /** 花销，如 "15k" */
  expenditure?: string
  /** 点赞数，如 2.8k */
  likes: number
  /** 可选：发布日期，用于个人页面 */
  date?: string
  /** 头像 */
  avatarUrl?: string
  /** 作者昵称 */
  nickname?: string
  /** 点击回调 */
  onClick?: () => void
  /** 点赞状态变化的回调函数 */
  onLikeChange?: (newLikes: number) => void
}

export interface WaterfallListProps {
  data: WaterfallCardProps[]
  onCardClick?: (id: string) => void
  onLikeChange?: (index: number, newLikes: number) => void
  className?: string
  style?: React.CSSProperties
  itemHeight?: number
  onLoadMore?: () => void
  hasMore?: boolean // 是否还有更多数据
  loading?: boolean // 是否正在加载
}