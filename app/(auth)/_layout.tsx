
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





// import React, { useEffect, useState } from 'react';
// import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
// import { Tabs } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { FontAwesome, Ionicons } from '@expo/vector-icons';
// import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// import { 
//   StreamVideo, 
//   StreamVideoClient, 
//   User,
//   StreamClientOptions
// } from '@stream-io/video-react-native-sdk';

// // Environment variables
// const API_KEY = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// if (!API_KEY || !API_URL) {
//   throw new Error('Missing environment variables. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL');
// }

// const Layout = () => {
//   const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

//   // Handle Firebase authentication state
//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged((user) => {
//       setCurrentUser(user);
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   // Initialize Stream video client when user is authenticated
//   useEffect(() => {
//     if (!currentUser) return;

//     const initializeVideoClient = async () => {
//       try {
//         const streamUser: User = {
//           id: currentUser.uid,
//           name: currentUser.email || currentUser.uid,
//           image: currentUser.photoURL || 'https://i.pinimg.com/564x/cf/75/bf/cf75bf663c116150f1076d72ac62e406.jpg',
//         };

//         const tokenProvider = async () => {
//           const response = await fetch(`${API_URL}/api/create-user/`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               userId: currentUser.uid,
//               name: currentUser.email || currentUser.uid,
//               image: streamUser.image,
//               email: currentUser.email || '',
//             }),
//           });

//           if (!response.ok) {
//             throw new Error(`Token fetch failed: ${response.statusText}`);
//           }

//           const { token } = await response.json();
//           return token;
//         };

//         const clientOptions: StreamClientOptions = {
//           logger: () => {}, // Disable logging in production
//         };

//         const client = StreamVideoClient.getOrCreateInstance({
//           apiKey: API_KEY,
//           user: streamUser,
//           tokenProvider,
//           options: clientOptions,
//         });

//         await client.connectUser({ id: streamUser.id }, tokenProvider);
//         setVideoClient(client);
//       } catch (error) {
//         console.error('Failed to initialize video client:', error);
//       }
//     };

//     initializeVideoClient();
//   }, [currentUser]);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#f14612" />
//         <Text style={styles.loaderText}>Initializing video client...</Text>
//       </View>
//     );
//   }

//   if (!currentUser) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Please sign in to access video calls</Text>
//       </View>
//     );
//   }

//   if (!videoClient) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#f14612" />
//         <Text style={styles.loaderText}>Connecting to video service...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StreamVideo client={videoClient}>
//         <Tabs
//           screenOptions={({ route }) => ({
//             header: () => null,
//             tabBarActiveTintColor: '#f14612',
//             tabBarInactiveTintColor: '#8e8e93',
//             tabBarStyle: {
//               display: route.name === '[id]' ? 'none' : 'flex',
//               backgroundColor: '#fff',
//               borderTopWidth: 0.5,
//               borderTopColor: '#dcdcdc',
//             },
//             tabBarLabelStyle: {
//               paddingBottom: 5,
//               fontSize: 12,
//               fontWeight: 'bold',
//             },
//           })}
//         >
//           <Tabs.Screen
//             name="home"
//             options={{
//               title: 'All Calls',
//               tabBarIcon: ({ color }) => (
//                 <Ionicons name="call-outline" size={24} color={color} />
//               ),
//             }}
//           />
//           <Tabs.Screen
//             name="[id]"
//             options={{
//               title: 'Start a New Call',
//               unmountOnBlur: true,
//               tabBarIcon: () => (
//                 <View style={styles.plusIconContainer}>
//                   <FontAwesome name="plus-circle" size={30} color="black" style={styles.plusIcon} />
//                 </View>
//               ),
//             }}
//           />
//           <Tabs.Screen
//             name="join"
//             options={{
//               title: 'Join Call',
//               headerTitle: 'Enter the Room ID',
//               tabBarIcon: ({ color }) => (
//                 <Ionicons name="enter-outline" size={24} color={color} />
//               ),
//             }}
//           />
//         </Tabs>
//       </StreamVideo>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loaderText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#555',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: '#ff0000',
//     textAlign: 'center',
//   },
//   plusIconContainer: {
//     position: 'absolute',
//     justifyContent: 'center',
//     alignItems: 'center',
//     top: -10,
//     left: 20,
//     right: 20,
//     bottom: 0,
//     margin: 'auto',
//     borderRadius: 50,
//     zIndex: 100,
//     backgroundColor: 'white',
//     borderColor: 'lightgray',
//     borderWidth: 0.2,
//     borderTopWidth: 1,
//     borderBottomWidth: 0,
//   },
//   plusIcon: {
//     zIndex: 200,
//   },
// });

// export default Layout;


// // import React, { useEffect, useState } from 'react';
// // import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
// // import { Tabs } from 'expo-router';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // import { StreamVideo, StreamVideoClient, LogLevel, User } from '@stream-io/video-react-native-sdk';

// // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// // if (!apiKey || !apiUrl) {
// //   throw new Error('Missing API Key or API URL. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL in your .env');
// // }

// // const Layout = () => {
// //   const [myUser, setMyUser] = useState<FirebaseAuthTypes.User | null>(null);
// //   const [loading, setLoading] = useState<boolean>(true);

// //   useEffect(() => {
// //     const unsubscribe = auth().onAuthStateChanged((myUser) => {
// //       setMyUser(myUser);
// //       setLoading(false);
// //     });
// //     return () => unsubscribe();
// //   }, []);

// //   if (loading) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <ActivityIndicator size="large" color="#f14612" />
// //         <Text style={styles.loaderText}>Please wait, loading...</Text>
// //       </View>
// //     );
// //   }

// //   if (!myUser) {
// //     return (
// //       <View style={styles.errorContainer}>
// //         <Text style={styles.errorText}>User not authenticated. Please log in.</Text>
// //       </View>
// //     );
// //   }

// //   const user: User = {
// //     id: myUser?.uid,
// //     name: myUser.email!,
// //     image: myUser?.photoURL || 'https://i.pinimg.com/564x/cf/75/bf/cf75bf663c116150f1076d72ac62e406.jpg',
// //   }

// //   const tokenProvider = async (): Promise<string> => {
// //     try {
// //       const userData = {
// //         userId: myUser?.uid,
// //         name: myUser?.email || '',
// //         image: myUser?.photoURL || 'https://i.pinimg.com/564x/cf/75/bf/cf75bf663c116150f1076d72ac62e406.jpg',
// //         email: myUser?.email || '',
// //       };

// //       const response = await fetch(`${apiUrl}/api/create-user/`, {

// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(userData),
// //       });

// //       if (!response.ok) {
// //         const errorText = await response.text();
// //         throw new Error(`Error fetching token: ${response.statusText}. Response: ${errorText}`);
// //       }

// //       const data = await response.json();
// //       console.log("myToken=============: ", data.token)
// //       return data.token;
// //     } catch (error: any) {
// //       throw new Error(`Token provider failed: ${error.message}`);
// //     }
// //   };

// //   const client = StreamVideoClient.getOrCreateInstance({
// //     apiKey,
// //     user,
// //     tokenProvider,
// //     options: {
// //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {},
// //     },
// //   });

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StreamVideo client={client} />
// //       <Tabs
// //         screenOptions={({ route }) => ({
// //           header: () => null,
// //           tabBarActiveTintColor: '#f14612',
// //           tabBarInactiveTintColor: '#8e8e93',
// //           tabBarStyle: {
// //             display: route.name === '[id]' ? 'none' : 'flex',
// //             backgroundColor: '#fff',
// //             borderTopWidth: 0.5,
// //             borderTopColor: '#dcdcdc',
// //           },
// //           tabBarLabelStyle: {
// //             paddingBottom: 5,
// //             fontSize: 12,
// //             fontWeight: 'bold'
// //           },
// //         })}
// //       >
// //         <Tabs.Screen
// //           name="home"
// //           options={{
// //             title: 'All Calls',
// //             tabBarIcon: ({ color }) => (
// //               <Ionicons name="call-outline" size={24} color={color} />
// //             ),
// //           }}
// //         />
// //         <Tabs.Screen
// //           name="[id]"
// //           options={{
// //             title: 'Start a New Call',
// //             unmountOnBlur: true,
// //             header: () => null,
// //             tabBarIcon: () => (
// //               <View style={styles.plusIconContainer}>
// //                 <FontAwesome
// //                   name="plus-circle"
// //                   size={30}
// //                   color="black"
// //                   style={styles.plusIcon}
// //                 />
// //               </View>
// //             ),
// //           }}
// //         />
// //         <Tabs.Screen
// //           name="join"
// //           options={{
// //             title: 'Join Call',
// //             headerTitle: 'Enter the Room ID',
// //             tabBarIcon: ({ color }) => (
// //               <Ionicons name="enter-outline" size={24} color={color} />
// //             ),
// //           }}
// //         />
// //       </Tabs>
// //     </SafeAreaView>
// //   );
// // };

// // export default Layout;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f5f5f5',
// //   },
// //   loaderContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //   },
// //   loaderText: {
// //     marginTop: 10,
// //     fontSize: 16,
// //     color: '#555',
// //   },
// //   errorContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingHorizontal: 20,
// //   },
// //   errorText: {
// //     fontSize: 18,
// //     color: '#ff0000',
// //     textAlign: 'center',
// //   },
// //   plusIconContainer: {
// //     position: 'absolute',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     top: -10,
// //     left: 20,
// //     right: 20,
// //     bottom: 0,
// //     margin: 'auto',
// //     borderRadius: 50,
// //     zIndex: 100,
// //     backgroundColor: 'white',
// //     borderColor: 'lightgray',
// //     borderWidth: 0.2,
// //     borderTopWidth: 1,
// //     borderBottomWidth: 0,
// //   },
// //   plusIcon: {
// //     zIndex: 200,
// //   },
// // });


// // // import React, { useEffect, useState } from 'react';
// // // import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
// // // import { Tabs } from 'expo-router';
// // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // import { StreamVideo, StreamVideoClient, LogLevel } from '@stream-io/video-react-native-sdk';

// // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// // // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// // // if (!apiKey || !apiUrl) {
// // //   throw new Error('Missing API Key or API URL. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL in your .env');
// // // }

// // // const Layout: React.FC = () => {
// // //   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
// // //   const [loading, setLoading] = useState<boolean>(true);

// // //   useEffect(() => {
// // //     const unsubscribe = auth().onAuthStateChanged((user) => {
// // //       setUser(user);
// // //       setLoading(false);
// // //     });
// // //     return () => unsubscribe();
// // //   }, []);

// // //   if (loading) {
// // //     return (
// // //       <View style={styles.loaderContainer}>
// // //         <ActivityIndicator size="large" color="#f14612" />
// // //         <Text style={styles.loaderText}>Please wait, loading...</Text>
// // //       </View>
// // //     );
// // //   }

// // //   if (!user) {
// // //     return (
// // //       <View style={styles.errorContainer}>
// // //         <Text style={styles.errorText}>User not authenticated. Please log in.</Text>
// // //       </View>
// // //     );
// // //   }

// // //   const tokenProvider = async (): Promise<string> => {
// // //     try {
// // //       const userData = {
// // //         userId: user?.uid,
// // //         name: user?.displayName || 'Anonymous',
// // //         image: user?.photoURL || '',
// // //         email: user?.email || '',
// // //       };

// // //       console.log('Sending user data to backend:', userData);

// // //       const response = await fetch(`${apiUrl}/api/create-user/`, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify(userData),
// // //       });

// // //       if (!response.ok) {
// // //         const errorText = await response.text();
// // //         throw new Error(`Error fetching token: ${response.statusText}. Response: ${errorText}`);
// // //       }

// // //       const data = await response.json();
// // //       console.log("MyToken__: ", data.token)
// // //       return data.token;
// // //     } catch (error: any) {
// // //       console.error('Token provider error:', error);
// // //       throw new Error(`Token provider failed: ${error.message}`);
// // //     }
// // //   };

// // //   const client = StreamVideoClient.getOrCreateInstance({
// // //     apiKey,
// // //     user: {
// // //       id: user?.uid,
// // //       name: user?.email || 'Anonymous',
// // //       image: user?.photoURL || '',
// // //     },
// // //     tokenProvider,
// // //     options: {
// // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // //         // Optional logging here
// // //       },
// // //     },
// // //   });

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <StreamVideo client={client} />
// // //       <Tabs
// // //         screenOptions={({ route }) => ({
// // //           header: () => null,
// // //           tabBarActiveTintColor: '#f14612',
// // //           tabBarInactiveTintColor: '#8e8e93',
// // //           tabBarStyle: {
// // //             display: route.name === '[id]' ? 'none' : 'flex',
// // //             backgroundColor: '#fff',
// // //             borderTopWidth: 0.5,
// // //             borderTopColor: '#dcdcdc',
// // //           },
// // //           tabBarLabelStyle: {
// // //             paddingBottom: 5,
// // //             fontSize: 12,
// // //           },
// // //         })}
// // //       >
// // //         <Tabs.Screen
// // //           name="home"
// // //           options={{
// // //             title: 'All Calls',
// // //             tabBarIcon: ({ color }) => (
// // //               <Ionicons name="call-outline" size={24} color={color} />
// // //             ),
// // //           }}
// // //         />
// // //         <Tabs.Screen
// // //           name="[id]"
// // //           options={{
// // //             title: 'Start a New Call',
// // //             unmountOnBlur: true,
// // //             tabBarIcon: () => (
// // //               <View style={styles.plusIconContainer}>
// // //                 <FontAwesome
// // //                   name="plus-circle"
// // //                   size={40}
// // //                   color="#f14612"
// // //                   style={styles.plusIcon}
// // //                 />
// // //               </View>
// // //             ),
// // //           }}
// // //         />
// // //         <Tabs.Screen
// // //           name="join"
// // //           options={{
// // //             title: 'Join Call',
// // //             headerTitle: 'Enter the Room ID',
// // //             tabBarIcon: ({ color }) => (
// // //               <Ionicons name="enter-outline" size={24} color={color} />
// // //             ),
// // //           }}
// // //         />
// // //       </Tabs>
// // //     </SafeAreaView>
// // //   );
// // // };

// // // export default Layout;

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#f5f5f5',
// // //   },
// // //   loaderContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //   },
// // //   loaderText: {
// // //     marginTop: 10,
// // //     fontSize: 16,
// // //     color: '#555',
// // //   },
// // //   errorContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 20,
// // //   },
// // //   errorText: {
// // //     fontSize: 18,
// // //     color: '#ff0000',
// // //     textAlign: 'center',
// // //   },
// // //   plusIconContainer: {
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     top: -10,
// // //     backgroundColor: 'white',
// // //     borderRadius: 50,
// // //     borderColor: 'lightgray',
// // //     borderWidth: 1,
// // //     zIndex: 100,
// // //   },
// // //   plusIcon: {
// // //     zIndex: 200,
// // //   },
// // // });


// // // // import React, { useEffect, useState } from 'react';
// // // // import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
// // // // import { Tabs } from 'expo-router';
// // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // // import { StreamVideo, StreamVideoClient, LogLevel } from '@stream-io/video-react-native-sdk';

// // // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// // // // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// // // // if (!apiKey || !apiUrl) {
// // // //   throw new Error("Missing API Key or API URL. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL in your .env");
// // // // }

// // // // const Layout: React.FC = () => {
// // // //   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
// // // //   const [loading, setLoading] = useState<boolean>(true);

// // // //   useEffect(() => {
// // // //     // Listen for authentication changes and set the user state
// // // //     const unsubscribe = auth().onAuthStateChanged((user) => {
// // // //       setUser(user);
// // // //       setLoading(false);
// // // //     });
// // // //     return () => unsubscribe();  // Cleanup subscription on unmount
// // // //   }, []);

// // // //   if (loading) {
// // // //     return (
// // // //       <View style={styles.loaderContainer}>
// // // //         <ActivityIndicator size="large" color="#f14612" />
// // // //         <Text style={styles.loaderText}>Loading...</Text>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   if (!user) {
// // // //     return (
// // // //       <View style={styles.errorContainer}>
// // // //         <Text style={styles.errorText}>User not authenticated. Please log in.</Text>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   const tokenProvider = async (): Promise<string> => {
// // // //     try {
// // // //         const userData = {
// // // //             userId: user?.uid,  // Change this to 'userId' instead of 'UserId'
// // // //             name: user?.displayName || "Anonymous",
// // // //             image: user?.photoURL || "",
// // // //             email: user?.email || "",
// // // //         };

// // // //         // Log the user data being sent
// // // //         console.log("Sending user data to backend:", userData);

// // // //         const response = await fetch(`${apiUrl}/api/create-user/`, {
// // // //             method: "POST",
// // // //             headers: {
// // // //                 "Content-Type": "application/json",
// // // //             },
// // // //             body: JSON.stringify(userData),
// // // //         });

// // // //         if (!response.ok) {
// // // //             const errorText = await response.text();
// // // //             throw new Error(`Error fetching token: ${response.statusText}. Response: ${errorText}`);
// // // //         }

// // // //         const data = await response.json();
// // // //         return data.token;
// // // //     } catch (error: any) {
// // // //         console.error("Token provider error:", error);
// // // //         throw new Error(`Token provider failed: ${error.message}`);
// // // //     }
// // // // };


// // // //   const client = StreamVideoClient.getOrCreateInstance({
// // // //     apiKey,
// // // //     user: {
// // // //       id: user?.uid,
// // // //       name: user?.displayName || "Anonymous",
// // // //       image: user?.photoURL || "",
// // // //     },
// // // //     tokenProvider,
// // // //     options: {
// // // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // // //         // console.log(`[${loglevel}] ${message}`, ...args);
// // // //       },
// // // //     },
// // // //   });

// // // //   return (
// // // //     <SafeAreaView style={styles.container}>
// // // //       <StreamVideo client={client} />
// // // //       <Tabs
// // // //         screenOptions={({ route }) => ({
// // // //           header: () => null,
// // // //           tabBarActiveTintColor: '#f14612',
// // // //           tabBarInactiveTintColor: '#8e8e93',
// // // //           tabBarStyle: {
// // // //             display: route.name === '[id]' ? 'none' : 'flex',
// // // //             backgroundColor: '#fff',
// // // //             borderTopWidth: 0.5,
// // // //             borderTopColor: '#dcdcdc',
// // // //           },
// // // //           tabBarLabelStyle: {
// // // //             paddingBottom: 5,
// // // //             fontSize: 12,
// // // //           },
// // // //         })}
// // // //       >
// // // //         <Tabs.Screen
// // // //           name="home"
// // // //           options={{
// // // //             title: 'All Calls',
// // // //             tabBarIcon: ({ color }) => (
// // // //               <Ionicons name="call-outline" size={24} color={color} />
// // // //             ),
// // // //           }}
// // // //         />
// // // //         <Tabs.Screen
// // // //           name="[id]"
// // // //           options={{
// // // //             title: 'Start a New Call',
// // // //             unmountOnBlur: true,
// // // //             tabBarIcon: () => (
// // // //               <View style={styles.plusIconContainer}>
// // // //                 <FontAwesome
// // // //                   name="plus-circle"
// // // //                   size={40}
// // // //                   color="#f14612"
// // // //                   style={styles.plusIcon}
// // // //                 />
// // // //               </View>
// // // //             ),
// // // //           }}
// // // //         />
// // // //         <Tabs.Screen
// // // //           name="join"
// // // //           options={{
// // // //             title: 'Join Call',
// // // //             headerTitle: 'Enter the Room ID',
// // // //             tabBarIcon: ({ color }) => (
// // // //               <Ionicons name="enter-outline" size={24} color={color} />
// // // //             ),
// // // //           }}
// // // //         />
// // // //       </Tabs>
// // // //     </SafeAreaView>
// // // //   );
// // // // };

// // // // export default Layout;

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: '#f5f5f5',
// // // //   },
// // // //   loaderContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   loaderText: {
// // // //     marginTop: 10,
// // // //     fontSize: 16,
// // // //     color: '#555',
// // // //   },
// // // //   errorContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     paddingHorizontal: 20,
// // // //   },
// // // //   errorText: {
// // // //     fontSize: 18,
// // // //     color: '#ff0000',
// // // //     textAlign: 'center',
// // // //   },
// // // //   plusIconContainer: {
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     top: -10,
// // // //     backgroundColor: 'white',
// // // //     borderRadius: 50,
// // // //     borderColor: 'lightgray',
// // // //     borderWidth: 1,
// // // //     zIndex: 100,
// // // //   },
// // // //   plusIcon: {
// // // //     zIndex: 200,
// // // //   },
// // // // });



// // // // // import React, { useEffect, useState } from 'react';
// // // // // import { StyleSheet, View } from 'react-native';
// // // // // import { Tabs } from 'expo-router';
// // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // // // import { StreamVideo, StreamVideoClient, LogLevel } from '@stream-io/video-react-native-sdk';

// // // // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// // // // // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// // // // // if (!apiKey || !apiUrl) {
// // // // //   throw new Error("Missing API Key or API URL. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL in your .env");
// // // // // }

// // // // // const Layout: React.FC = () => {
// // // // //   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

// // // // //   useEffect(() => {
// // // // //     // Listen for authentication changes and set the user state
// // // // //     const unsubscribe = auth().onAuthStateChanged((user) => {
// // // // //       if (user) {
// // // // //         setUser(user);
// // // // //       } else {
// // // // //         console.log("User not authenticated");
// // // // //       }
// // // // //     });
// // // // //     return () => unsubscribe();  // Cleanup subscription on unmount
// // // // //   }, []);

// // // // //   if (!user) {
// // // // //     return null;  // Optionally, show a loading state or redirect to login
// // // // //   }

// // // // //   const tokenProvider = async (): Promise<string> => {
// // // // //     try {
// // // // //       const response = await fetch(`${apiUrl}/api/create-user/`, {
// // // // //         method: "POST",
// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //         },
// // // // //         body: JSON.stringify({
// // // // //           UserId: user?.email,  // Use Firebase UID for unique identification
// // // // //           name: user?.displayName || "Anonymous",
// // // // //           image: user?.photoURL || "",
// // // // //           email: user.email || "",
// // // // //         }),
// // // // //       });
  
// // // // //       if (!response.ok) {
// // // // //         const errorText = await response.text(); // Get the response text for better error visibility
// // // // //         throw new Error(`Error fetching token: ${response.statusText}. Response: ${errorText}`);
// // // // //       }
  
// // // // //       const data = await response.json();
// // // // //       return data.token;
// // // // //     } catch (error: any) {
// // // // //       console.error("Token provider error:", error);
// // // // //       throw new Error(`Token provider failed: ${error.message}`);
// // // // //     }
// // // // //   };
  

// // // // //   const client = StreamVideoClient.getOrCreateInstance({
// // // // //     apiKey,
// // // // //     user: {
// // // // //       id: user?.uid,
// // // // //       name: user?.displayName || "Anonymous",
// // // // //       image: user?.photoURL || "",
// // // // //     },
// // // // //     tokenProvider,
// // // // //     options: {
// // // // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // // // //         // console.log(`[${loglevel}] ${message}`, ...args);
// // // // //       },
// // // // //     },
// // // // //   });

// // // // //   return (
// // // // //     <SafeAreaView style={{ flex: 1 }}>
// // // // //       <StreamVideo client={client} />
// // // // //       <Tabs
// // // // //         screenOptions={({ route }) => ({
// // // // //           header: () => null,
// // // // //           tabBarActiveTintColor: '#f14612',
// // // // //           tabBarStyle: {
// // // // //             display: route.name === '[id]' ? 'none' : 'flex',
// // // // //           },
// // // // //           tabBarLabelStyle: {
// // // // //             zIndex: 100,
// // // // //             paddingBottom: 5,
// // // // //           },
// // // // //         })}
// // // // //       >
// // // // //         <Tabs.Screen
// // // // //           name="home"
// // // // //           options={{
// // // // //             title: 'All Calls',
// // // // //             tabBarIcon: ({ color }) => (
// // // // //               <Ionicons name="call-outline" size={24} color={color} />
// // // // //             ),
// // // // //           }}
// // // // //         />
// // // // //         <Tabs.Screen
// // // // //           name="[id]"
// // // // //           options={{
// // // // //             title: 'Start a New Call',
// // // // //             unmountOnBlur: true,
// // // // //             tabBarIcon: () => (
// // // // //               <View style={styles.plusIconContainer}>
// // // // //                 <FontAwesome
// // // // //                   name="plus-circle"
// // // // //                   size={30}
// // // // //                   color="black"
// // // // //                   style={styles.plusIcon}
// // // // //                 />
// // // // //               </View>
// // // // //             ),
// // // // //           }}
// // // // //         />
// // // // //         <Tabs.Screen
// // // // //           name="join"
// // // // //           options={{
// // // // //             title: 'Join Call',
// // // // //             headerTitle: 'Enter the Room ID',
// // // // //             tabBarIcon: ({ color }) => (
// // // // //               <Ionicons name="enter-outline" size={24} color={color} />
// // // // //             ),
// // // // //           }}
// // // // //         />
// // // // //       </Tabs>
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // };

// // // // // export default Layout;

// // // // // const styles = StyleSheet.create({
// // // // //   plusIconContainer: {
// // // // //     position: 'absolute',
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     top: -10,
// // // // //     left: 20,
// // // // //     right: 20,
// // // // //     margin: 'auto',
// // // // //     borderRadius: 50,
// // // // //     backgroundColor: 'white',
// // // // //     borderColor: 'lightgray',
// // // // //     borderWidth: 0.2,
// // // // //     borderTopWidth: 1,
// // // // //     zIndex: 100,
// // // // //   },
// // // // //   plusIcon: {
// // // // //     zIndex: 200,
// // // // //   },
// // // // // });




// // // // // // import React from 'react';
// // // // // // import { StyleSheet, View } from 'react-native';
// // // // // // import { Tabs } from 'expo-router';
// // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // // // // import { StreamVideo, StreamVideoClient, LogLevel } from '@stream-io/video-react-native-sdk';

// // // // // // // Get API key and URL from environment variables
// // // // // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// // // // // // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// // // // // // if (!apiKey || !apiUrl) {
// // // // // //   throw new Error("Missing API Key or API URL. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL in your .env");
// // // // // // }

// // // // // // const Layout: React.FC = () => {
// // // // // //   // Get the current Firebase authenticated user
// // // // // //   const user: FirebaseAuthTypes.User | null = auth().currentUser ;

// // // // // //   if (!user) {
// // // // // //     throw new Error("User  not authenticated");
// // // // // //   }


// // // // // //   // Function to fetch a token from the backend
// // // // // // const tokenProvider = async (): Promise<string> => {
// // // // // //   try {
// // // // // //     const response = await fetch(`${apiUrl}/api/create-user/`, {
// // // // // //       method: "POST",
// // // // // //       headers: {
// // // // // //         "Content-Type": "application/json",
// // // // // //       },
// // // // // //       body: JSON.stringify({
// // // // // //         userId: user?.uid,  // Ensure Firebase UID is provided
// // // // // //         name: user?.displayName || "Anonymous",  // Default to 'Anonymous' if no name
// // // // // //         image: user?.photoURL || "",  // Default to an empty string if no image
// // // // // //         email: user?.email || "",  // Default to an empty string if no email
// // // // // //       }),
// // // // // //     });

// // // // // //     if (!response.ok) {
// // // // // //       throw new Error(`Error fetching token: ${response.statusText}`);
// // // // // //     }

// // // // // //     const data = await response.json();
// // // // // //     return data.token;  // Return the token from the response
// // // // // //   } catch (error: any) {
// // // // // //     console.error("Token provider error:", error);
// // // // // //     throw new Error(`Token provider failed: ${error.message}`);
// // // // // //   }
// // // // // // };


// // // // // //   // Function to fetch a token from the backend
// // // // // //   // const tokenProvider = async (): Promise<string> => {
// // // // // //   //   try {
// // // // // //   //     const response = await fetch(`${apiUrl}/api/create-user/`, {
// // // // // //   //       method: "POST",
// // // // // //   //       headers: {
// // // // // //   //         "Content-Type": "application/json",
// // // // // //   //       },
// // // // // //   //       body: JSON.stringify({
// // // // // //   //         userId: user.uid,  // Use Firebase UID for unique identification
// // // // // //   //         name: user.displayName || "Anonymous",
// // // // // //   //         image: user.photoURL || "",
// // // // // //   //         email: user.email || "",
// // // // // //   //       }),
// // // // // //   //     });

// // // // // //   //     if (!response.ok) {
// // // // // //   //       throw new Error(`Error fetching token: ${response.statusText}`);
// // // // // //   //     }

// // // // // //   //     const data = await response.json();
// // // // // //   //     return data.token;
// // // // // //   //   } catch (error) {
// // // // // //   //     console.error("Token provider error:", error);
// // // // // //   //     throw error;
// // // // // //   //   }
// // // // // //   // };

// // // // // //   // Initialize the StreamVideoClient with the user and token provider
// // // // // //   const client = StreamVideoClient.getOrCreateInstance({
// // // // // //     apiKey,
// // // // // //     user: {
// // // // // //       id: user.uid,
// // // // // //       name: user.displayName || "Anonymous",
// // // // // //       image: user.photoURL || "",
// // // // // //     },
// // // // // //     tokenProvider,
// // // // // //     options: {
// // // // // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // // // // //         console.log(`[${loglevel}] ${message}`, ...args);
// // // // // //       },
// // // // // //     },
// // // // // //   });

// // // // // //   return (
// // // // // //     <SafeAreaView style={{ flex: 1 }}>
// // // // // //       <StreamVideo client={client} />
// // // // // //       <Tabs
// // // // // //         screenOptions={({ route }) => ({
// // // // // //           header: () => null,
// // // // // //           tabBarActiveTintColor: '#f14612',
// // // // // //           tabBarStyle: {
// // // // // //             display: route.name === '[id]' ? 'none' : 'flex',
// // // // // //           },
// // // // // //           tabBarLabelStyle: {
// // // // // //             zIndex: 100,
// // // // // //             paddingBottom: 5,
// // // // // //           },
// // // // // //         })}
// // // // // //       >
// // // // // //         <Tabs.Screen
// // // // // //           name="home"
// // // // // //           options={{
// // // // // //             title: 'All Calls',
// // // // // //             tabBarIcon: ({ color }) => (
// // // // // //               <Ionicons name="call-outline" size={24} color={color} />
// // // // // //             ),
// // // // // //           }}
// // // // // //         />
// // // // // //         <Tabs.Screen
// // // // // //           name="[id]"
// // // // // //           options={{
// // // // // //             title: 'Start a New Call',
// // // // // //             unmountOnBlur: true,
// // // // // //             tabBarIcon: () => (
// // // // // //               <View style={styles.plusIconContainer}>
// // // // // //                 <FontAwesome
// // // // // //                   name="plus-circle"
// // // // // //                   size={30}
// // // // // //                   color="black"
// // // // // //                   style={styles.plusIcon}
// // // // // //                 />
// // // // // //               </View>
// // // // // //             ),
// // // // // //           }}
// // // // // //         />
// // // // // //         <Tabs.Screen
// // // // // //           name="join"
// // // // // //           options={{
// // // // // //             title: 'Join Call',
// // // // // //             headerTitle: 'Enter the Room ID',
// // // // // //             tabBarIcon: ({ color }) => (
// // // // // //               <Ionicons name="enter-outline" size={24} color={color} />
// // // // // //             ),
// // // // // //           }}
// // // // // //         />
// // // // // //       </Tabs>
// // // // // //     </SafeAreaView>
// // // // // //   );
// // // // // // };

// // // // // // export default Layout;

// // // // // // const styles = StyleSheet.create({
// // // // // //   plusIconContainer: {
// // // // // //     position: 'absolute',
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //     top: -10,
// // // // // //     left: 20,
// // // // // //     right: 20,
// // // // // //     margin: 'auto',
// // // // // //     borderRadius: 50,
// // // // // //     backgroundColor: 'white',
// // // // // //     borderColor: 'lightgray',
// // // // // //     borderWidth: 0.2,
// // // // // //     borderTopWidth: 1,
// // // // // //     zIndex: 100,
// // // // // //   },
// // // // // //   plusIcon: {
// // // // // //     zIndex: 200,
// // // // // //   },
// // // // // // });

// // // // // // // import React from 'react';
// // // // // // // import { StyleSheet, View } from 'react-native';
// // // // // // // import { Tabs } from 'expo-router';
// // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // // // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // // // // // import { StreamVideo, StreamVideoClient, LogLevel } from '@stream-io/video-react-native-sdk';

// // // // // // // // Get API key and URL from environment variables
// // // // // // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// // // // // // // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// // // // // // // if (!apiKey || !apiUrl) {
// // // // // // //   throw new Error("Missing API Key or API URL. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL in your .env");
// // // // // // // }

// // // // // // // const Layout: React.FC = () => {
// // // // // // //   // Get the current Firebase authenticated user
// // // // // // //   const user: FirebaseAuthTypes.User | null = auth().currentUser ;

// // // // // // //   if (!user) {
// // // // // // //     throw new Error("User  not authenticated");
// // // // // // //   }
  
// // // // // // //   // console.log("API URL: ", apiUrl);

// // // // // // //   // Function to fetch a token from the backend
// // // // // // //   const tokenProvider = async (): Promise<string> => {
// // // // // // //     try {
// // // // // // //       const response = await fetch(`${apiUrl}/api/create-user/`, {
// // // // // // //         method: "POST",
// // // // // // //         headers: {
// // // // // // //           "Content-Type": "application/json",
// // // // // // //         },
// // // // // // //         body: JSON.stringify({
// // // // // // //           userId: user.email,  // or a unique user ID of your choice
// // // // // // //           name: user.displayName || "Anonymous",
// // // // // // //           image: user.photoURL || "",
// // // // // // //           email: user.email || "",
// // // // // // //         }),
// // // // // // //       });

// // // // // // //       if (!response.ok) {
// // // // // // //         throw new Error(`Error fetching token: ${response.statusText}`);
// // // // // // //       }

// // // // // // //       const data = await response.json();
// // // // // // //       return data.token;
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Token provider error:", error);
// // // // // // //       throw error;
// // // // // // //     }
// // // // // // //   };

// // // // // // //   // Initialize the StreamVideoClient with the user and token provider
// // // // // // //   const client = StreamVideoClient.getOrCreateInstance({
// // // // // // //     apiKey,
// // // // // // //     user: {
// // // // // // //       id: user.uid,
// // // // // // //       name: user.displayName || "Anonymous",
// // // // // // //       image: user.photoURL || "",
// // // // // // //     },
// // // // // // //     tokenProvider,
// // // // // // //     options: {
// // // // // // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // // // // // //         console.log(`[${loglevel}] ${message}`, ...args);
// // // // // // //       },
// // // // // // //     },
// // // // // // //   });

// // // // // // //   return (
// // // // // // //     <SafeAreaView style={{ flex: 1 }}>
// // // // // // //       <StreamVideo client={client} />
// // // // // // //       <Tabs
// // // // // // //         screenOptions={({ route }) => ({
// // // // // // //           header: () => null,
// // // // // // //           tabBarActiveTintColor: '#f14612',
// // // // // // //           tabBarStyle: {
// // // // // // //             display: route.name === '[id]' ? 'none' : 'flex',
// // // // // // //           },
// // // // // // //           tabBarLabelStyle: {
// // // // // // //             zIndex: 100,
// // // // // // //             paddingBottom: 5,
// // // // // // //           },
// // // // // // //         })}
// // // // // // //       >
// // // // // // //         <Tabs.Screen
// // // // // // //           name="home"
// // // // // // //           options={{
// // // // // // //             title: 'All Calls',
// // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // //               <Ionicons name="call-outline" size={24} color={color} />
// // // // // // //             ),
// // // // // // //           }}
// // // // // // //         />
// // // // // // //         <Tabs.Screen
// // // // // // //           name="[id]"
// // // // // // //           options={{
// // // // // // //             title: 'Start a New Call',
// // // // // // //             unmountOnBlur: true,
// // // // // // //             tabBarIcon: () => (
// // // // // // //               <View style={styles.plusIconContainer}>
// // // // // // //                 <FontAwesome
// // // // // // //                   name="plus-circle"
// // // // // // //                   size={30}
// // // // // // //                   color="black"
// // // // // // //                   style={styles.plusIcon}
// // // // // // //                 />
// // // // // // //               </View>
// // // // // // //             ),
// // // // // // //           }}
// // // // // // //         />
// // // // // // //         <Tabs.Screen
// // // // // // //           name="join"
// // // // // // //           options={{
// // // // // // //             title: 'Join Call',
// // // // // // //             headerTitle: 'Enter the Room ID',
// // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // //               <Ionicons name="enter-outline" size={24} color={color} />
// // // // // // //             ),
// // // // // // //           }}
// // // // // // //         />
// // // // // // //       </Tabs>
// // // // // // //     </SafeAreaView>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default Layout;

// // // // // // // const styles = StyleSheet.create({
// // // // // // //   plusIconContainer: {
// // // // // // //     position: 'absolute',
// // // // // // //     justifyContent: 'center',
// // // // // // //     alignItems: 'center',
// // // // // // //     top: -10,
// // // // // // //     left: 20,
// // // // // // //     right: 20,
// // // // // // //     margin: 'auto',
// // // // // // //     borderRadius: 50,
// // // // // // //     backgroundColor: 'white',
// // // // // // //     borderColor: 'lightgray',
// // // // // // //     borderWidth: 0.2,
// // // // // // //     borderTopWidth: 1,
// // // // // // //     zIndex: 100,
// // // // // // //   },
// // // // // // //   plusIcon : {
// // // // // // //     zIndex: 200,
// // // // // // //   },
// // // // // // // });



// // // // // // // // import { StyleSheet, View } from 'react-native';
// // // // // // // // import React from 'react';
// // // // // // // // import { Tabs } from 'expo-router';
// // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // // // // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // // // // // // import { StreamVideo, StreamVideoClient, LogLevel } from '@stream-io/video-react-native-sdk';

// // // // // // // // // Get API key from environment variables
// // // // // // // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
// // // // // // // // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// // // // // // // // if (!apiKey || !apiUrl) {
// // // // // // // //   throw new Error("Missing API Key or API URL. Please set EXPO_PUBLIC_GET_STREAM_API_KEY and EXPO_PUBLIC_API_URL in your .env");
// // // // // // // // }

// // // // // // // // const Layout = () => {
// // // // // // // //   // Get the current Firebase authenticated user
// // // // // // // //   const user: FirebaseAuthTypes.User | null = auth().currentUser;
// // // // // // // //   console.log("Current User: ", user);

// // // // // // // //   if (!user) {
// // // // // // // //     throw new Error("User not authenticated");
// // // // // // // //   }

// // // // // // // //   // Function to fetch a token from the backend
// // // // // // // //   const tokenProvider = async () => {
// // // // // // // //     try {
// // // // // // // //       const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/create-user/`, {
// // // // // // // //         method: "POST",
// // // // // // // //         headers: {
// // // // // // // //           "Content-Type": "application/json",
// // // // // // // //         },
// // // // // // // //         body: JSON.stringify({
// // // // // // // //           userId: user?.email,  // or a unique user ID of your choice
// // // // // // // //           name: user?.displayName || "Anonymous",
// // // // // // // //           image: user?.photoURL || "",
// // // // // // // //           email: user?.email || "",
// // // // // // // //         }),
// // // // // // // //       });
  
// // // // // // // //       if (!response.ok) {
// // // // // // // //         throw new Error(`Error fetching token: ${response.statusText}`);
// // // // // // // //       }
  
// // // // // // // //       const data = await response.json();
// // // // // // // //       return data.token;
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error("Token provider error:", error);
// // // // // // // //       throw error;
// // // // // // // //     }
// // // // // // // //   };
  

// // // // // // // //   // Initialize the StreamVideoClient with the user and token provider
// // // // // // // //   const client = StreamVideoClient.getOrCreateInstance({
// // // // // // // //     apiKey,
// // // // // // // //     user: {
// // // // // // // //       id: user.uid,
// // // // // // // //       name: user.displayName || "Anonymous",
// // // // // // // //       image: user.photoURL || "",
// // // // // // // //     },
// // // // // // // //     tokenProvider,
// // // // // // // //     options: {
// // // // // // // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // // // // // // //         // Custom logging (if needed)
// // // // // // // //         console.log(`[${loglevel}] ${message}`, ...args);
// // // // // // // //       },
// // // // // // // //     },
// // // // // // // //   });

// // // // // // // //   return (
// // // // // // // //     <SafeAreaView style={{ flex: 1 }}>
// // // // // // // //       <StreamVideo client={client} />
// // // // // // // //       <Tabs
// // // // // // // //         screenOptions={({ route }) => ({
// // // // // // // //           header: () => null,
// // // // // // // //           tabBarActiveTintColor: '#5F5DEC',
// // // // // // // //           tabBarStyle: {
// // // // // // // //             display: route.name === '[id]' ? 'none' : 'flex',
// // // // // // // //           },
// // // // // // // //           tabBarLabelStyle: {
// // // // // // // //             zIndex: 100,
// // // // // // // //             paddingBottom: 5,
// // // // // // // //           },
// // // // // // // //         })}
// // // // // // // //       >
// // // // // // // //         <Tabs.Screen
// // // // // // // //           name="home"
// // // // // // // //           options={{
// // // // // // // //             title: 'All Calls',
// // // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // // //               <Ionicons name="call-outline" size={24} color={color} />
// // // // // // // //             ),
// // // // // // // //           }}
// // // // // // // //         />
// // // // // // // //         <Tabs.Screen
// // // // // // // //           name="[id]"
// // // // // // // //           options={{
// // // // // // // //             title: 'Start a New Call',
// // // // // // // //             unmountOnBlur: true,
// // // // // // // //             tabBarIcon: () => (
// // // // // // // //               <View style={styles.plusIconContainer}>
// // // // // // // //                 <FontAwesome
// // // // // // // //                   name="plus-circle"
// // // // // // // //                   size={30}
// // // // // // // //                   color="black"
// // // // // // // //                   style={styles.plusIcon}
// // // // // // // //                 />
// // // // // // // //               </View>
// // // // // // // //             ),
// // // // // // // //           }}
// // // // // // // //         />
// // // // // // // //         <Tabs.Screen
// // // // // // // //           name="join"
// // // // // // // //           options={{
// // // // // // // //             title: 'Join Call',
// // // // // // // //             headerTitle: 'Enter the Room ID',
// // // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // // //               <Ionicons name="enter-outline" size={24} color={color} />
// // // // // // // //             ),
// // // // // // // //           }}
// // // // // // // //         />
// // // // // // // //       </Tabs>
// // // // // // // //     </SafeAreaView>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default Layout;

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //   plusIconContainer: {
// // // // // // // //     position: 'absolute',
// // // // // // // //     justifyContent: 'center',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     top: -10,
// // // // // // // //     left: 20,
// // // // // // // //     right: 20,
// // // // // // // //     margin: 'auto',
// // // // // // // //     borderRadius: 50,
// // // // // // // //     backgroundColor: 'white',
// // // // // // // //     borderColor: 'lightgray',
// // // // // // // //     borderWidth: 0.2,
// // // // // // // //     borderTopWidth: 1,
// // // // // // // //     zIndex: 100,
// // // // // // // //   },
// // // // // // // //   plusIcon: {
// // // // // // // //     zIndex: 200,
// // // // // // // //   },
// // // // // // // // });



// // // // // // // // // import { StyleSheet, View } from 'react-native';
// // // // // // // // // import React from 'react';
// // // // // // // // // import { Tabs } from 'expo-router';
// // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // // // // // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // // // // // // // import {
// // // // // // // // //   StreamVideo,
// // // // // // // // //   StreamVideoClient,
// // // // // // // // //   LogLevel,
// // // // // // // // // } from '@stream-io/video-react-native-sdk';

// // // // // // // // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;

// // // // // // // // // if (!apiKey) {
// // // // // // // // //   throw new Error(
// // // // // // // // //     "Missing API Key. Please set EXPO_PUBLIC_GET_STREAM_API_KEY in your .env"
// // // // // // // // //   );
// // // // // // // // // }

// // // // // // // // // const Layout = () => {
// // // // // // // // //   // Get the current Firebase authenticated user
// // // // // // // // //   const user: FirebaseAuthTypes.User | null = auth().currentUser;

// // // // // // // // //   if (!user) {
// // // // // // // // //     throw new Error("User not authenticated");
// // // // // // // // //   }

// // // // // // // // //   const tokenProvider = async () => {
// // // // // // // // //     try {
// // // // // // // // //         const response = await fetch(
// // // // // // // // //             `${process.env.EXPO_PUBLIC_API_URL}/generate-user-token/`,
// // // // // // // // //             {
// // // // // // // // //                 method: "POST",
// // // // // // // // //                 headers: {
// // // // // // // // //                     "Content-Type": "application/json",
// // // // // // // // //                 },
// // // // // // // // //                 body: JSON.stringify({
// // // // // // // // //                     userId: user.uid,
// // // // // // // // //                     name: user.displayName || "Anonymous", // Default to "Anonymous" if null
// // // // // // // // //                     image: user.photoURL || "", // Default to empty string if null
// // // // // // // // //                     email: user.email || "", // Default to empty string if null
// // // // // // // // //                 }),
// // // // // // // // //             }
// // // // // // // // //         );

// // // // // // // // //         if (!response.ok) {
// // // // // // // // //             throw new Error(`Error fetching token: ${response.statusText}`);
// // // // // // // // //         }

// // // // // // // // //         const data = await response.json();
// // // // // // // // //         return data.token;
// // // // // // // // //     } catch (error) {
// // // // // // // // //         console.error("Token provider error:", error);
// // // // // // // // //         throw error;
// // // // // // // // //     }
// // // // // // // // // };


// // // // // // // // //   // const tokenProvider = async () => {
// // // // // // // // //   //   try {
// // // // // // // // //   //     const response = await fetch(
// // // // // // // // //   //       `${process.env.EXPO_PUBLIC_API_URL}/generateUserToken`,
// // // // // // // // //   //       {
// // // // // // // // //   //         method: "POST",
// // // // // // // // //   //         headers: {
// // // // // // // // //   //           "Content-Type": "application/json",
// // // // // // // // //   //         },
// // // // // // // // //   //         body: JSON.stringify({
// // // // // // // // //   //           userId: user.uid,
// // // // // // // // //   //           name: user.displayName || "Anonymous",
// // // // // // // // //   //           image: user.photoURL || "", // Handle cases where image might be null
// // // // // // // // //   //           email: user.email || "",
// // // // // // // // //   //         }),
// // // // // // // // //   //       }
// // // // // // // // //   //     );

// // // // // // // // //   //     if (!response.ok) {
// // // // // // // // //   //       throw new Error(`Error fetching token: ${response.statusText}`);
// // // // // // // // //   //     }

// // // // // // // // //   //     const data = await response.json();
// // // // // // // // //   //     return data.token;
// // // // // // // // //   //   } catch (error) {
// // // // // // // // //   //     console.error("Token provider error:", error);
// // // // // // // // //   //     throw error;
// // // // // // // // //   //   }
// // // // // // // // //   // };

// // // // // // // // //   // Initialize StreamVideoClient
// // // // // // // // //   const client = StreamVideoClient.getOrCreateInstance({
// // // // // // // // //     apiKey,
// // // // // // // // //     user: {
// // // // // // // // //       id: user.uid,
// // // // // // // // //       name: user.displayName || "Anonymous",
// // // // // // // // //       image: user.photoURL || "",
// // // // // // // // //     },
// // // // // // // // //     tokenProvider,
// // // // // // // // //     options: {
// // // // // // // // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // // // // // // // //         // Add custom logging here if necessary
// // // // // // // // //       },
// // // // // // // // //     },
// // // // // // // // //   });

// // // // // // // // //   return (
// // // // // // // // //     <SafeAreaView style={{ flex: 1 }}>
// // // // // // // // //       <StreamVideo client={client} />
// // // // // // // // //       <Tabs
// // // // // // // // //         screenOptions={({ route }) => ({
// // // // // // // // //           header: () => null,
// // // // // // // // //           tabBarActiveTintColor: '#5F5DEC',
// // // // // // // // //           tabBarStyle: {
// // // // // // // // //             display: route.name === '[id]' ? 'none' : 'flex',
// // // // // // // // //           },
// // // // // // // // //           tabBarLabelStyle: {
// // // // // // // // //             zIndex: 100,
// // // // // // // // //             paddingBottom: 5,
// // // // // // // // //           },
// // // // // // // // //         })}
// // // // // // // // //       >
// // // // // // // // //         <Tabs.Screen
// // // // // // // // //           name="home"
// // // // // // // // //           options={{
// // // // // // // // //             title: 'All Calls',
// // // // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // // // //               <Ionicons name="call-outline" size={24} color={color} />
// // // // // // // // //             ),
// // // // // // // // //           }}
// // // // // // // // //         />
// // // // // // // // //         <Tabs.Screen
// // // // // // // // //           name="[id]"
// // // // // // // // //           options={{
// // // // // // // // //             title: 'Start a New Call',
// // // // // // // // //             unmountOnBlur: true,
// // // // // // // // //             tabBarIcon: () => (
// // // // // // // // //               <View style={styles.plusIconContainer}>
// // // // // // // // //                 <FontAwesome
// // // // // // // // //                   name="plus-circle"
// // // // // // // // //                   size={30}
// // // // // // // // //                   color="black"
// // // // // // // // //                   style={styles.plusIcon}
// // // // // // // // //                 />
// // // // // // // // //               </View>
// // // // // // // // //             ),
// // // // // // // // //           }}
// // // // // // // // //         />
// // // // // // // // //         <Tabs.Screen
// // // // // // // // //           name="join"
// // // // // // // // //           options={{
// // // // // // // // //             title: 'Join Call',
// // // // // // // // //             headerTitle: 'Enter the Room ID',
// // // // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // // // //               <Ionicons name="enter-outline" size={24} color={color} />
// // // // // // // // //             ),
// // // // // // // // //           }}
// // // // // // // // //         />
// // // // // // // // //       </Tabs>
// // // // // // // // //     </SafeAreaView>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default Layout;

// // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // //   plusIconContainer: {
// // // // // // // // //     position: 'absolute',
// // // // // // // // //     justifyContent: 'center',
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     top: -10,
// // // // // // // // //     left: 20,
// // // // // // // // //     right: 20,
// // // // // // // // //     margin: 'auto',
// // // // // // // // //     borderRadius: 50,
// // // // // // // // //     backgroundColor: 'white',
// // // // // // // // //     borderColor: 'lightgray',
// // // // // // // // //     borderWidth: 0.2,
// // // // // // // // //     borderTopWidth: 1,
// // // // // // // // //     zIndex: 100,
// // // // // // // // //   },
// // // // // // // // //   plusIcon: {
// // // // // // // // //     zIndex: 200,
// // // // // // // // //   },
// // // // // // // // // });


// // // // // // // // // // import { StyleSheet, View } from 'react-native';
// // // // // // // // // // import React from 'react';
// // // // // // // // // // import { Tabs } from 'expo-router';
// // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // // // // // // // import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// // // // // // // // // // import {
// // // // // // // // // //   StreamCall,
// // // // // // // // // //   StreamVideo,
// // // // // // // // // //   StreamVideoClient,
// // // // // // // // // //   LogLevel,
// // // // // // // // // // } from '@stream-io/video-react-native-sdk';

// // // // // // // // // // const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;

// // // // // // // // // // if (!apiKey) {
// // // // // // // // // //   throw new Error(
// // // // // // // // // //     "Missing API Key. Please set EXPO_PUBLIC_GET_STREAM_API_KEY in your .env"
// // // // // // // // // //   );
// // // // // // // // // // }

// // // // // // // // // // const Layout = () => {
// // // // // // // // // //   // Get the current Firebase authenticated user
// // // // // // // // // //   const user: FirebaseAuthTypes.User | null = auth().currentUser;

// // // // // // // // // //   if (!user) {
// // // // // // // // // //     throw new Error("User not authenticated");
// // // // // // // // // //   }

// // // // // // // // // //   const tokenProvider = async () => {
// // // // // // // // // //     try {
// // // // // // // // // //       const response = await fetch(
// // // // // // // // // //         `${process.env.EXPO_PUBLIC_API_URL}/generateUserToken`,
// // // // // // // // // //         {
// // // // // // // // // //           method: "POST",
// // // // // // // // // //           headers: {
// // // // // // // // // //             "Content-Type": "application/json",
// // // // // // // // // //           },
// // // // // // // // // //           body: JSON.stringify({
// // // // // // // // // //             userId: user.uid,
// // // // // // // // // //             name: user.displayName || "Anonymous",
// // // // // // // // // //             image: user.photoURL || "", // Handle cases where image might be null
// // // // // // // // // //             email: user.email || "",
// // // // // // // // // //           }),
// // // // // // // // // //         }
// // // // // // // // // //       );

// // // // // // // // // //       if (!response.ok) {
// // // // // // // // // //         throw new Error(`Error fetching token: ${response.statusText}`);
// // // // // // // // // //       }

// // // // // // // // // //       const data = await response.json();
// // // // // // // // // //       return data.token;
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error("Token provider error:", error);
// // // // // // // // // //       throw error;
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   // Initialize StreamVideoClient
// // // // // // // // // //   const client = StreamVideoClient.getOrCreateInstance({
// // // // // // // // // //     apiKey,
// // // // // // // // // //     user: {
// // // // // // // // // //       id: user.uid,
// // // // // // // // // //       name: user.displayName || "Anonymous",
// // // // // // // // // //       image: user.photoURL || "",
// // // // // // // // // //     },
// // // // // // // // // //     tokenProvider,
// // // // // // // // // //     options: {
// // // // // // // // // //       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
// // // // // // // // // //         // Add custom logging here if necessary
// // // // // // // // // //       },
// // // // // // // // // //     },
// // // // // // // // // //   });

// // // // // // // // // //   return (
// // // // // // // // // //     <SafeAreaView style={{ flex: 1 }}>
// // // // // // // // // //       <StreamVideo client={client} />
// // // // // // // // // //       <Tabs
// // // // // // // // // //         screenOptions={({ route }) => ({
// // // // // // // // // //           header: () => null,
// // // // // // // // // //           tabBarActiveTintColor: '#5F5DEC',
// // // // // // // // // //           tabBarStyle: {
// // // // // // // // // //             display: route.name === '[id]' ? 'none' : 'flex',
// // // // // // // // // //           },
// // // // // // // // // //           tabBarLabelStyle: {
// // // // // // // // // //             zIndex: 100,
// // // // // // // // // //             paddingBottom: 5,
// // // // // // // // // //           },
// // // // // // // // // //         })}
// // // // // // // // // //       >
// // // // // // // // // //         <Tabs.Screen
// // // // // // // // // //           name="home"
// // // // // // // // // //           options={{
// // // // // // // // // //             title: 'All Calls',
// // // // // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // // // // //               <Ionicons name="call-outline" size={24} color={color} />
// // // // // // // // // //             ),
// // // // // // // // // //           }}
// // // // // // // // // //         />
// // // // // // // // // //         <Tabs.Screen
// // // // // // // // // //           name="[id]"
// // // // // // // // // //           options={{
// // // // // // // // // //             title: 'Start a New Call',
// // // // // // // // // //             unmountOnBlur: true,
// // // // // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // // // // //               <View
// // // // // // // // // //                 style={{
// // // // // // // // // //                   position: 'absolute',
// // // // // // // // // //                   justifyContent: 'center',
// // // // // // // // // //                   alignItems: 'center',
// // // // // // // // // //                   top: -10,
// // // // // // // // // //                   left: 20,
// // // // // // // // // //                   right: 20,
// // // // // // // // // //                   bottom: 0,
// // // // // // // // // //                   margin: 'auto',
// // // // // // // // // //                   borderRadius: 50,
// // // // // // // // // //                   zIndex: 100,
// // // // // // // // // //                   backgroundColor: 'white',
// // // // // // // // // //                   borderColor: 'lightgray',
// // // // // // // // // //                   borderWidth: 0.2,
// // // // // // // // // //                   borderTopWidth: 1,
// // // // // // // // // //                   borderBottomWidth: 0,
// // // // // // // // // //                 }}
// // // // // // // // // //               >
// // // // // // // // // //                 <FontAwesome
// // // // // // // // // //                   name="plus-circle"
// // // // // // // // // //                   size={30}
// // // // // // // // // //                   color="black"
// // // // // // // // // //                   style={{
// // // // // // // // // //                     zIndex: 200,
// // // // // // // // // //                   }}
// // // // // // // // // //                 />
// // // // // // // // // //               </View>
// // // // // // // // // //             ),
// // // // // // // // // //           }}
// // // // // // // // // //         />
// // // // // // // // // //         <Tabs.Screen
// // // // // // // // // //           name="join"
// // // // // // // // // //           options={{
// // // // // // // // // //             title: 'Join Call',
// // // // // // // // // //             headerTitle: 'Enter the Room ID',
// // // // // // // // // //             tabBarIcon: ({ color }) => (
// // // // // // // // // //               <Ionicons name="enter-outline" size={24} color={color} />
// // // // // // // // // //             ),
// // // // // // // // // //           }}
// // // // // // // // // //         />
// // // // // // // // // //       </Tabs>
// // // // // // // // // //     </SafeAreaView>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default Layout;

// // // // // // // // // // const styles = StyleSheet.create({});

