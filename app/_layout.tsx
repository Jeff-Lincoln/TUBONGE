import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [initializing, setInitializing ] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  const router = useRouter();
  const segments = useSegments();

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("onAuthStateChanged: ", user);
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;

  }, []);

  useEffect(() => {
    if(initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && !inAuthGroup) {
      router.replace('/(auth)/home');
    } else if (!user && inAuthGroup) {
      router.replace('/')
    }

  }, [user, initializing])

  if (initializing) 
    return (
  <View style={{
    alignItems: 'center',
    justifyContent:'center',
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
    paddingTop: 60,
    zIndex: 1000,
  }}>
    <ActivityIndicator size="large" color="#0eeb71"/>
  </View>);
  

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="(auth)" options={{
        headerShown: false,
      }} />
    </Stack>
  );
}
