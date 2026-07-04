import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

// This is the initial/fallback screen of the (app) Stack.
// It is never meant to be visible — it just routes traffic:
//   • unauthenticated → login
//   • authenticated   → back to root AppNavigator
//
// <Redirect href="/" /> was removed because inside the (app) Stack,
// router.replace('/') resolves to THIS screen again, causing an infinite loop.
// router.back() correctly pops the (app) Stack to the parent navigator (root /).
export default function AppIndex() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    } else {
      router.back();
    }
  }, []);

  return null;
}
