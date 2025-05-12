// API响应接口
export interface ApiResponse {
  data: Message[];
  status: number;
  message: string;
}

// 消息类型
export enum MessageType {
  REVIEW = 'review',   // 游记审核
  LIKE = 'like',      // 游记点赞
}

// 审核状态
export enum ReviewStatus {
  PENDING = 'pending',    // 审核中
  APPROVED = 'approved',  // 通过
  REJECTED = 'rejected',  // 拒绝
}

// 消息接口
export interface Message {
  id: string
  type: MessageType
  title: string
  content: string
  status?: ReviewStatus
  createdAt: string
  isRead: boolean
  thumbnail?: string
  fromUser?: {
    nickname: string
    avatar: string
  }
}
