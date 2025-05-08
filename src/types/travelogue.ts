export interface TravelogueData {
  travel_id: number;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  location: string;
  start_date: string;
  end_date: string;
  participants: number;
  expenditure: number;
  likes: number;
  video_url?: string;
  rejection_reason?: string;
  author: {
    user_id: string;
    nickname: string;
    avatar: string;
  };
  images: {
    image_id: number;
    image_url: string;
    order: number;
  }[];
  is_liked: boolean;
} 