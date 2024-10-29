
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { 
  StreamVideo, 
  StreamVideoClient, 
  User,
  StreamClientOptions
} from '@stream-io/video-react-native-sdk';

// Environment variables
const API_KEY = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_KEY || !API_URL) {
  throw new Error('Missing environment variables. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL');
}

const Layout = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const fadeAnim = new Animated.Value(0); // for fade animation
  
  // Handle Firebase authentication state
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Initialize Stream video client when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const initializeVideoClient = async () => {
      try {
        const streamUser: User = {
          id: currentUser.uid,
          name: currentUser.email || currentUser.uid,
          image: currentUser.photoURL || 'https://i.pinimg.com/564x/cf/75/bf/cf75bf663c116150f1076d72ac62e406.jpg',
        };

        const tokenProvider = async () => {
          const response = await fetch(`${API_URL}/api/create-user/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              name: currentUser.email || currentUser.uid,
              image: streamUser.image,
              email: currentUser.email || '',
            }),
          });

          if (!response.ok) {
            throw new Error(`Token fetch failed: ${response.statusText}`);
          }

          const { token } = await response.json();
          return token;
        };

        const clientOptions: StreamClientOptions = {
          logger: () => {}, // Disable logging in production
        };

        const client = StreamVideoClient.getOrCreateInstance({
          apiKey: API_KEY,
          user: streamUser,
          tokenProvider,
          options: clientOptions,
        });

        await client.connectUser({ id: streamUser.id }, tokenProvider);
        setVideoClient(client);
      } catch (error) {
        console.error('Failed to initialize video client:', error);
      }
    };

    initializeVideoClient();
  }, [currentUser]);

  // Animation to fade in the loading screen
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  if (loading) {
    return (
      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color="#f14612" />
        <Text style={styles.loaderText}>Initializing video client...</Text>
      </Animated.View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please sign in to access video calls</Text>
      </View>
    );
  }

  if (!videoClient) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f14612" />
        <Text style={styles.loaderText}>Connecting to video service...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StreamVideo client={videoClient}>
        <Tabs
          screenOptions={({ route }) => ({
            header: () => null,
            tabBarActiveTintColor: '#f1540b',
            tabBarInactiveTintColor: '#8e8e93',
            tabBarStyle: {
              display: route.name === '[id]' ? 'none' : 'flex',
              backgroundColor: '#fff',
              borderTopWidth: 0.5,
              borderTopColor: '#dcdcdc',
            },
            tabBarLabelStyle: {
              paddingBottom: 5,
              fontSize: 12,
              fontWeight: 'bold',
            },
          })}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: 'All Calls',
              tabBarIcon: ({ color }) => (
                <Ionicons name="call-outline" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="[id]"
            options={{
              title: 'Start a New Call',
              unmountOnBlur: true,
              tabBarIcon: () => (
                <View style={styles.plusIconContainer}>
                  <FontAwesome name="plus-circle" size={30} color="#000" style={styles.plusIcon} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="join"
            options={{
              title: 'Join Call',
              headerTitle: 'Enter the Room ID',
              tabBarIcon: ({ color }) => (
                <Ionicons name="enter-outline" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </StreamVideo>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
  },
  plusIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: -10,
    left: 20,
    right: 20,
    bottom: 0,
    margin: 'auto',
    borderRadius: 50,
    zIndex: 100,
    backgroundColor: 'white',
    borderColor: 'lightgray',
    borderWidth: 0.2,
    borderTopWidth: 1,
    borderBottomWidth: 0,
  },
  plusIcon: {
    zIndex: 200,
  },
});

export default Layout;


