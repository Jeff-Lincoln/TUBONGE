import React from "react";
import { Stack, useRouter, useSegments, Slot } from "expo-router";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-root-toast';

const { width, height } = Dimensions.get('window');

// Keep splash screen visible while resources load
SplashScreen.preventAutoHideAsync();

// Enhanced Loading Animation Component
const LoadingScreen = ({ progress = new Animated.Value(0) }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animations = [
      // Fade and scale in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Start rotating and pulsing
      Animated.parallel([
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 1000,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ];

    Animated.sequence(animations).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#1a237e', '#311b92', '#4a148c']}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { rotate },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <MaterialIcons name="video-camera-front" size={60} color="#ffffff" />
        </Animated.View>

        <Animated.Text style={styles.title}>
          Tubonge
        </Animated.Text>

        <Animated.Text style={styles.subtitle}>
          Connect • Share • Communicate
        </Animated.Text>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

// Auth State Provider Component
const AuthStateProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      
      const inAuthGroup = segments[0] === "(auth)";
      
      if (!user && inAuthGroup) {
        router.replace("/");
        Toast.show('Please sign in to continue', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          backgroundColor: '#311b92',
        });
      } else if (user && !inAuthGroup) {
        router.replace("/(auth)/home");
        Toast.show(`Welcome back, ${user.displayName || user.email}`, {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          backgroundColor: '#311b92',
        });
      }
    });

    return unsubscribe;
  }, [segments]);

  return <>{children}</>;
};

// Root Layout Component
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Start loading animation
        Animated.timing(loadingProgress, {
          toValue: 70,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        // Load resources
        await Promise.all([
          Font.loadAsync({
            ...Ionicons.font,
            ...MaterialIcons.font,
          }),
          // Add other async resources here
          new Promise(resolve => setTimeout(resolve, 2000)), // Simulate loading
        ]);

        // Complete loading animation
        Animated.timing(loadingProgress, {
          toValue: 100,
          duration: 500,
          useNativeDriver: false,
        }).start();

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return (
    <View style={styles.rootView} onLayout={onLayoutRootView}>
      <StatusBar 
        translucent 
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <AuthStateProvider>
        <RootSiblingParent>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.rootView}>
              <Slot />
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </RootSiblingParent>
      </AuthStateProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#ff9800',
    marginTop: 8,
    letterSpacing: 1.5,
    fontWeight: '500',
  },
  progressContainer: {
    width: width * 0.7,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff9800',
    borderRadius: 2,
  },
});


// import { Stack, useRouter, useSegments, Slot } from "expo-router";
// import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
// import { useCallback, useEffect, useState, useRef } from "react";
// import {
//   View,
//   StyleSheet,
//   Animated,
//   Easing,
//   Dimensions,
//   StatusBar,
// } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { RootSiblingParent } from 'react-native-root-siblings';
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import * as SplashScreen from 'expo-splash-screen';
// import * as Font from 'expo-font';
// import { Entypo } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialIcons } from '@expo/vector-icons';

// // Get screen dimensions
// const { width, height } = Dimensions.get('window');

// // Enhanced Loading Spinner with Animation
// const LoadingSpinner = () => {
//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const bounceAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Sequence of animations
//     Animated.parallel([
//       // Fade in
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       // Scale up
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 20,
//         friction: 7,
//         useNativeDriver: true,
//       }),
//       // Continuous rotation
//       Animated.loop(
//         Animated.timing(rotateAnim, {
//           toValue: 1,
//           duration: 6000,
//           easing: Easing.linear,
//           useNativeDriver: true,
//         })
//       ),
//       // Continuous bounce
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(bounceAnim, {
//             toValue: 1,
//             duration: 1500,
//             easing: Easing.bezier(0.4, 0, 0.2, 1),
//             useNativeDriver: true,
//           }),
//           Animated.timing(bounceAnim, {
//             toValue: 0,
//             duration: 1500,
//             easing: Easing.bezier(0.4, 0, 0.2, 1),
//             useNativeDriver: true,
//           }),
//         ])
//       ),
//     ]).start();
//   }, []);

//   const rotate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   const bounce = bounceAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, -30],
//   });

//   return (
//     <LinearGradient
//       colors={['#1a237e', '#311b92', '#4a148c']}
//       style={styles.container}
//     >
//       <StatusBar translucent backgroundColor="transparent" />
      
//       <Animated.View
//         style={[
//           styles.content,
//           {
//             opacity: fadeAnim,
//             transform: [
//               { scale: scaleAnim },
//               { translateY: bounce },
//             ],
//           },
//         ]}
//       >
//         <Animated.View
//           style={[
//             styles.iconContainer,
//             {
//               transform: [{ rotate }],
//             },
//           ]}
//         >
//           <MaterialIcons name="video-camera-front" size={60} color="#ffffff" />
//         </Animated.View>

//         <Animated.Text
//           style={[
//             styles.title,
//             {
//               opacity: fadeAnim,
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//         >
//           Tubonge
//         </Animated.Text>

//         <Animated.Text
//           style={[
//             styles.subtitle,
//             {
//               opacity: fadeAnim,
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//         >
//           Connect • Share • Communicate
//         </Animated.Text>
//       </Animated.View>
//     </LinearGradient>
//   );
// };

// // Root Layout Component
// export default function RootLayout() {
//   const [initializing, setInitializing] = useState(true);
//   const [appIsReady, setAppIsReady] = useState(false);
//   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

//   const router = useRouter();
//   const segments = useSegments();

//   // Handle authentication state changes
//   const onAuthStateChanged = useCallback((user: FirebaseAuthTypes.User | null) => {
//     console.log("Auth State Changed:", user?.email || "No user");
//     setUser(user);
//     if (initializing) setInitializing(false);
//   }, [initializing]);

//   // Set up authentication listener
//   useEffect(() => {
//     const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
//     return subscriber;
//   }, [onAuthStateChanged]);

//   // Prepare app resources
//   useEffect(() => {
//     async function prepare() {
//       try {
//         await Font.loadAsync({
//           ...Entypo.font,
//         });
        
//         // Simulate loading time (remove in production)
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         setAppIsReady(true);
//       }
//     }

//     prepare();
//   }, []);

//   // Handle navigation based on auth state
//   useEffect(() => {
//     if (!appIsReady || initializing) return;

//     const inAuthGroup = segments[0] === "(auth)";

//     if (!user && !inAuthGroup) {
//       router.replace("/");
//     } else if (user && !inAuthGroup) {
//       router.replace("/(auth)/home");
//     }
//   }, [user, segments, initializing, appIsReady, router]);

//   // Hide splash screen when app is ready
//   const onLayoutRootView = useCallback(async () => {
//     if (appIsReady) {
//       await SplashScreen.hideAsync();
//     }
//   }, [appIsReady]);

//   if (!appIsReady || initializing) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <View style={styles.rootView} onLayout={onLayoutRootView}>
//       <RootSiblingParent>
//         <SafeAreaProvider>
//           <GestureHandlerRootView style={styles.rootView}>
//             <Slot />
//           </GestureHandlerRootView>
//         </SafeAreaProvider>
//       </RootSiblingParent>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   rootView: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     width: width,
//     height: height,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   content: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   iconContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4.65,
//     elevation: 8,
//   },
//   title: {
//     fontSize: 48,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     // color: '#6a1b9a',
//     // color: '#A020F0',
//     // color: '#4a148c',
//     marginBottom: 8,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   subtitle: {
//     fontSize: 18,
//     // color: 'rgba(255, 255, 255, 0.8)',
//         color: '#d8632c',
//     marginTop: 8,
//     letterSpacing: 1,
//   },
// });



// // import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
// // import { Stack, useRouter, useSegments, Slot } from "expo-router";
// // import { useCallback, useEffect, useState } from "react";
// // import { ActivityIndicator, View, StyleSheet, Animated, Easing } from "react-native";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import { RootSiblingParent } from 'react-native-root-siblings';
// // import { SafeAreaProvider } from "react-native-safe-area-context";
// // import { Text } from 'react-native';
// // import * as SplashScreen from 'expo-splash-screen';
// // import * as Font from 'expo-font';
// // import { Entypo } from '@expo/vector-icons';

// // // Enhanced Loading Spinner with Animation
// // const LoadingSpinner = () => {
// //   const [animation] = useState(new Animated.Value(0));

// //   useEffect(() => {
// //     Animated.loop(
// //       Animated.sequence([
// //         Animated.timing(animation, {
// //           toValue: 1,
// //           duration: 1500,
// //           easing: Easing.ease,
// //           useNativeDriver: true,
// //         }),
// //         Animated.timing(animation, {
// //           toValue: 0,
// //           duration: 1500,
// //           easing: Easing.ease,
// //           useNativeDriver: true,
// //         })
// //       ])
// //     ).start();
// //   }, []);

// //   const rotateInterpolation = animation.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: ['0deg', '360deg']
// //   });

// //   const scaleInterpolation = animation.interpolate({
// //     inputRange: [0, 0.5, 1],
// //     outputRange: [1, 1.2, 1]
// //   });

// //   return (
// //     <View style={styles.loadingContainer}>
// //       <Animated.View 
// //         style={[
// //           styles.logoContainer, 
// //           { 
// //             transform: [
// //               { rotate: rotateInterpolation },
// //               { scale: scaleInterpolation }
// //             ] 
// //           }
// //         ]}
// //       >
// //         <Text style={styles.logoText}>Tubonge</Text>
// //       </Animated.View>
// //       <Text style={styles.loadingText}>Preparing your experience...</Text>
// //       <ActivityIndicator 
// //         size="large" 
// //         color="#f14612" 
// //         style={styles.activityIndicator} 
// //       />
// //     </View>
// //   );
// // };

// // // Keep splash screen visible while we fetch resources
// // SplashScreen.preventAutoHideAsync();

// // export default function RootLayout() {
// //   const [initializing, setInitializing] = useState(true);
// //   const [appIsReady, setAppIsReady] = useState(false);
// //   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

// //   const router = useRouter();
// //   const segments = useSegments();

// //   // Handle authentication state changes
// //   const onAuthStateChanged = useCallback((user: FirebaseAuthTypes.User | null) => {
// //     console.log("Auth State Changed:", user?.email || "No user");
// //     setUser(user);
// //     if (initializing) setInitializing(false);
// //   }, [initializing]);

// //   // Set up authentication listener
// //   useEffect(() => {
// //     const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
// //     return subscriber;
// //   }, [onAuthStateChanged]);

// //   // Prepare app resources
// //   useEffect(() => {
// //     async function prepare() {
// //       try {
// //         await Font.loadAsync({
// //           ...Entypo.font,
// //         });
        
// //         // Simulate loading time (remove in production)
// //         await new Promise(resolve => setTimeout(resolve, 2000));
// //       } catch (e) {
// //         console.warn(e);
// //       } finally {
// //         setAppIsReady(true);
// //       }
// //     }

// //     prepare();
// //   }, []);

// //   // Handle navigation based on auth state
// //   useEffect(() => {
// //     if (!appIsReady || initializing) return;

// //     const inAuthGroup = segments[0] === "(auth)";

// //     if (!user && inAuthGroup) {
// //       router.replace("/");
// //     } else if (user && !inAuthGroup) {
// //       router.replace("/(auth)/home");
// //     }
// //   }, [user, segments, initializing, appIsReady, router]);

// //   // Hide splash screen when app is ready
// //   const onLayoutRootView = useCallback(async () => {
// //     if (appIsReady) {
// //       await SplashScreen.hideAsync();
// //     }
// //   }, [appIsReady]);

// //   if (!appIsReady || initializing) {
// //     return <LoadingSpinner />;
// //   }

// //   return (
// //     <View style={styles.rootView} onLayout={onLayoutRootView}>
// //       <RootSiblingParent>
// //         <SafeAreaProvider>
// //           <GestureHandlerRootView style={styles.rootView}>
// //             <Slot />
// //           </GestureHandlerRootView>
// //         </SafeAreaProvider>
// //       </RootSiblingParent>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   rootView: {
// //     flex: 1,
// //     backgroundColor: '#FFFFFF',
// //   },
// //   stackContent: {
// //     backgroundColor: '#FFFFFF',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#f0f4f8',
// //     padding: 20,
// //     gap: 16,
// //   },
// //   logoContainer: {
// //     width: 120,
// //     height: 120,
// //     borderRadius: 60,
// //     backgroundColor: '#f14612',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginBottom: 20,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 5,
// //     elevation: 8,
// //   },
// //   logoText: {
// //     color: 'white',
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //   },
// //   loadingText: {
// //     marginTop: 12,
// //     fontSize: 16,
// //     color: '#333333',
// //     fontWeight: '500',
// //   },
// //   activityIndicator: {
// //     marginTop: 20,
// //   },
// // });