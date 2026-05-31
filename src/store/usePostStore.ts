import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { Post, PostStatus } from '@/types';

interface PostStore {
  drafts: Post[];
  scheduled: Post[];
  posted: Post[];
  selectedPostId: string | null;

  // CRUD
  addPost: (post: Post) => void;
  updatePost: (id: string, partial: Partial<Post>) => void;
  deletePost: (id: string) => void;

  // Status transitions
  moveToScheduled: (id: string) => void;
  markPosted: (id: string, ayrsharePostId?: string) => void;
  markFailed: (id: string) => void;

  // Selection
  setSelectedPostId: (id: string | null) => void;

  // Selectors
  getPostsByDate: (date: Date) => Post[];
  getPostById: (id: string) => Post | undefined;
}

function allPosts(state: PostStore): Post[] {
  return [...state.drafts, ...state.scheduled, ...state.posted];
}

function removeFromBuckets(
  state: Pick<PostStore, 'drafts' | 'scheduled' | 'posted'>,
  id: string,
): Pick<PostStore, 'drafts' | 'scheduled' | 'posted'> {
  return {
    drafts: state.drafts.filter((p) => p.id !== id),
    scheduled: state.scheduled.filter((p) => p.id !== id),
    posted: state.posted.filter((p) => p.id !== id),
  };
}

function updateInBuckets(
  state: Pick<PostStore, 'drafts' | 'scheduled' | 'posted'>,
  id: string,
  partial: Partial<Post>,
): Pick<PostStore, 'drafts' | 'scheduled' | 'posted'> {
  const applyUpdate = (posts: Post[]): Post[] =>
    posts.map((p) =>
      p.id === id ? { ...p, ...partial, updatedAt: new Date().toISOString() } : p,
    );
  return {
    drafts: applyUpdate(state.drafts),
    scheduled: applyUpdate(state.scheduled),
    posted: applyUpdate(state.posted),
  };
}

export const usePostStore = create<PostStore>()(
  persist(
    (set, get) => ({
      drafts: [],
      scheduled: [],
      posted: [],
      selectedPostId: null,

      addPost: (post) => {
        const now = new Date().toISOString();
        const newPost: Post = {
          ...post,
          createdAt: post.createdAt ?? now,
          updatedAt: now,
        };
        set((state) => {
          if (newPost.status === 'scheduled') {
            return { scheduled: [...state.scheduled, newPost] };
          }
          if (newPost.status === 'posted') {
            return { posted: [...state.posted, newPost] };
          }
          // draft, pending_review, failed → drafts bucket
          return { drafts: [...state.drafts, newPost] };
        });
      },

      updatePost: (id, partial) => {
        set((state) => updateInBuckets(state, id, partial));
      },

      deletePost: (id) => {
        set((state) => removeFromBuckets(state, id));
      },

      moveToScheduled: (id) => {
        set((state) => {
          const post = allPosts(state as PostStore).find((p) => p.id === id);
          if (!post) return {};
          const updated: Post = {
            ...post,
            status: 'scheduled' as PostStatus,
            updatedAt: new Date().toISOString(),
          };
          const buckets = removeFromBuckets(state, id);
          return { ...buckets, scheduled: [...buckets.scheduled, updated] };
        });
      },

      markPosted: (id, ayrsharePostId) => {
        set((state) => {
          const post = allPosts(state as PostStore).find((p) => p.id === id);
          if (!post) return {};
          const updated: Post = {
            ...post,
            status: 'posted' as PostStatus,
            ayrsharePostId: ayrsharePostId ?? post.ayrsharePostId,
            updatedAt: new Date().toISOString(),
          };
          const buckets = removeFromBuckets(state, id);
          return { ...buckets, posted: [...buckets.posted, updated] };
        });
      },

      markFailed: (id) => {
        set((state) => {
          const post = allPosts(state as PostStore).find((p) => p.id === id);
          if (!post) return {};
          const updated: Post = {
            ...post,
            status: 'failed' as PostStatus,
            updatedAt: new Date().toISOString(),
          };
          const buckets = removeFromBuckets(state, id);
          return { ...buckets, drafts: [...buckets.drafts, updated] };
        });
      },

      setSelectedPostId: (id) => set({ selectedPostId: id }),

      getPostsByDate: (date) => {
        const state = get();
        const target = dayjs(date).format('YYYY-MM-DD');
        return allPosts(state).filter((p) => {
          const dateStr = p.schedule?.scheduledAt ?? p.createdAt;
          return dayjs(dateStr).format('YYYY-MM-DD') === target;
        });
      },

      getPostById: (id) => {
        return allPosts(get()).find((p) => p.id === id);
      },
    }),
    {
      name: 'post-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
