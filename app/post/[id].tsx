import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { usePostStore } from '@/store/usePostStore';
import PostEditorScreen from '@/components/post/PostEditorScreen';

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPostById } = usePostStore();

  const post = id ? getPostById(id) : undefined;

  return <PostEditorScreen postId={id} existingPost={post} />;
}
