import { apiFetch, ApiResponse } from './api';

export interface CommunityAuthor {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar: string | null;
  is_verified_traveler: boolean;
  is_verified_sender: boolean;
  kyc_status: string;
  is_following: boolean;
}

export interface CommunityGroup {
  id: number;
  name: string;
  slug: string;
  group_type: 'CITY' | 'ROUTE';
  description: string;
  icon_name: string;
  origin_city?: string | null;
  destination_city?: string | null;
  members_count: number;
  posts_count: number;
  is_joined: boolean;
  created_at: string;
}

export type PostCategory =
  | 'UPCOMING_TRAVEL'
  | 'TRAVEL_EXPERIENCE'
  | 'AVAILABLE_ROUTE'
  | 'PARCEL_REQUIREMENT'
  | 'SUCCESS_STORY'
  | 'TRAVEL_TIPS'
  | 'FLYORA_EXPERIENCE';

export interface CommunityPost {
  id: number;
  group: number;
  group_name: string;
  group_type: 'CITY' | 'ROUTE';
  author: CommunityAuthor;
  category: PostCategory;
  title: string;
  content: string;
  origin_city?: string | null;
  destination_city?: string | null;
  travel_date?: string | null;
  available_capacity_kg?: string | number | null;
  linked_trip_id?: number | null;
  linked_booking_id?: number | null;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
}

export interface PostComment {
  id: number;
  post: number;
  author: CommunityAuthor;
  content: string;
  created_at: string;
}

export const CommunityService = {
  async getGroups(type?: 'CITY' | 'ROUTE', search?: string): Promise<ApiResponse<{ groups: CommunityGroup[]; total: number }>> {
    let url = '/api/community/groups/';
    const params: string[] = [];
    if (type) params.push(`type=${encodeURIComponent(type)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiFetch<{ groups: CommunityGroup[]; total: number }>(url);
  },

  async toggleJoinGroup(groupId: number): Promise<ApiResponse<{ joined: boolean; members_count: number }>> {
    return apiFetch<{ joined: boolean; members_count: number }>(`/api/community/groups/${groupId}/join/`, {
      method: 'POST',
    });
  },

  async getPosts(options: {
    groupId?: number;
    category?: PostCategory;
    tab?: 'all' | 'saved' | 'my_posts';
    search?: string;
  } = {}): Promise<ApiResponse<{ posts: CommunityPost[]; total: number }>> {
    let url = '/api/community/posts/';
    const params: string[] = [];
    if (options.groupId) params.push(`group_id=${options.groupId}`);
    if (options.category) params.push(`category=${encodeURIComponent(options.category)}`);
    if (options.tab) params.push(`tab=${encodeURIComponent(options.tab)}`);
    if (options.search) params.push(`search=${encodeURIComponent(options.search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiFetch<{ posts: CommunityPost[]; total: number }>(url);
  },

  async createPost(payload: {
    group: number;
    category: PostCategory;
    title: string;
    content: string;
    origin_city?: string;
    destination_city?: string;
    travel_date?: string;
    available_capacity_kg?: number;
  }): Promise<ApiResponse<{ post: CommunityPost }>> {
    return apiFetch<{ post: CommunityPost }>('/api/community/posts/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async toggleLikePost(postId: number): Promise<ApiResponse<{ is_liked: boolean; likes_count: number }>> {
    return apiFetch<{ is_liked: boolean; likes_count: number }>(`/api/community/posts/${postId}/like/`, {
      method: 'POST',
    });
  },

  async toggleSavePost(postId: number): Promise<ApiResponse<{ is_saved: boolean; saves_count: number }>> {
    return apiFetch<{ is_saved: boolean; saves_count: number }>(`/api/community/posts/${postId}/save/`, {
      method: 'POST',
    });
  },

  async getComments(postId: number): Promise<ApiResponse<{ comments: PostComment[] }>> {
    return apiFetch<{ comments: PostComment[] }>(`/api/community/posts/${postId}/comments/`);
  },

  async addComment(postId: number, content: string): Promise<ApiResponse<{ comment: PostComment; comments_count: number }>> {
    return apiFetch<{ comment: PostComment; comments_count: number }>(`/api/community/posts/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async toggleFollowUser(userId: number): Promise<ApiResponse<{ is_following: boolean }>> {
    return apiFetch<{ is_following: boolean }>(`/api/community/users/${userId}/follow/`, {
      method: 'POST',
    });
  },

  async reportPost(postId: number, reason: string, details?: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/api/community/posts/${postId}/report/`, {
      method: 'POST',
      body: JSON.stringify({ reason, details: details || '' }),
    });
  },
};
