import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from 'react-native';

// Custom loading spinner component for better UX
const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0eeb71" />
    <Text style={styles.loadingText}>Loading your experience...</Text>
  </View>
);

export default function RootLayout() {
  // State management for authentication and initialization
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  const router = useRouter();
  const segments = useSegments();

  // Handle authentication state changes
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("Auth State Changed:", user?.email || "No user");
    setUser(user);
    if (initializing) setInitializing(false);
  };

  // Set up authentication listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Cleanup subscription on unmount
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Redirect users based on authentication status
    if (user && !inAuthGroup) {
      router.replace("/(auth)/home");
    } else if (!user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, initializing]);

  // Show loading state while initializing
  if (initializing) {
    return <LoadingSpinner />;
  }

  // Main layout structure
  return (
    <RootSiblingParent>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.rootView}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.stackContent,
              animation: 'fade',
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="(auth)" 
              options={{
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </RootSiblingParent>
  );
}

// Styles for enhanced visual appeal and consistency
const styles = StyleSheet.create({
  rootView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stackContent: {
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
});

