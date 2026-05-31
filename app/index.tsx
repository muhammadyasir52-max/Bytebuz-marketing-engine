import { Redirect } from 'expo-router';
import { useBusinessStore } from '@/store/useBusinessStore';

export default function Index() {
  const { isOnboarded } = useBusinessStore();
  return <Redirect href={isOnboarded ? '/(tabs)' : '/(auth)/welcome'} />;
}
