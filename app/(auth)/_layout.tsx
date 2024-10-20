import { StyleSheet, View } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  LogLevel,
} from '@stream-io/video-react-native-sdk';

const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing API Key. Please set EXPO_PUBLIC_GET_STREAM_API_KEY in your .env"
  );
}

const Layout = () => {
  // Get the current Firebase authenticated user
  const user: FirebaseAuthTypes.User | null = auth().currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const tokenProvider = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/generateUserToken`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            name: user.displayName || "Anonymous",
            image: user.photoURL || "", // Handle cases where image might be null
            email: user.email || "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Token provider error:", error);
      throw error;
    }
  };

  // Initialize StreamVideoClient
  const client = StreamVideoClient.getOrCreateInstance({
    apiKey,
    user: {
      id: user.uid,
      name: user.displayName || "Anonymous",
      image: user.photoURL || "",
    },
    tokenProvider,
    options: {
      logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {
        // Add custom logging here if necessary
      },
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StreamVideo client={client} />
      <Tabs
        screenOptions={({ route }) => ({
          header: () => null,
          tabBarActiveTintColor: '#5F5DEC',
          tabBarStyle: {
            display: route.name === '[id]' ? 'none' : 'flex',
          },
          tabBarLabelStyle: {
            zIndex: 100,
            paddingBottom: 5,
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
            tabBarIcon: ({ color }) => (
              <View
                style={{
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
                }}
              >
                <FontAwesome
                  name="plus-circle"
                  size={30}
                  color="black"
                  style={{
                    zIndex: 200,
                  }}
                />
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
    </SafeAreaView>
  );
};

export default Layout;

const styles = StyleSheet.create({});



// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import { Stack, Tabs } from 'expo-router'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { FontAwesome, Ionicons } from '@expo/vector-icons';
// import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// import {
//   StreamCall,
//   StreamVideo,
//   StreamVideoClient,
//   User,
// } from '@stream-io/video-react-native-sdk';

// const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY

// if(!apiKey) {
//   throw new Error(
//     "Missing API Key. Please set EXPO_PUBLIC_GET_STREAM_API_KEY in your .env "
//   )
// }

// const Layout = () => {

//   const user :FirebaseAuthTypes.User | null = auth().currentUser;

//   const tokenProvider = async () => {
//     const response = await fetch(
//       `${process.env.EXPO_PUBLIC_API_URL}/generateUserToken`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: clerkUser.id,
//           name: clerkUser.fullName,
//           image: clerkUser.imageUrl,
//           email: clerkUser.primaryEmailAddress?.toString()!
//          }),
//       }
//     );
//     const data = await response.json();
//     return data.token;
//   }

//   const client = StreamVideoClient.getOrCreateInstance({
//     apiKey,
//     user,
//     tokenProvider,
//     options: {
//       logger: (loglevel: LogLevel, message: string, ...args: unknown[]) => {},
//     }
//   })  

//   return (
//     <SafeAreaView style={{ flex: 1}}>
//       <StreamVideo client={client}>
//         </StreamVideo>
//         <Tabs
//         screenOptions={({ route }) => ({
//           header: () => null,
//           tabBarActiveTintColor: '#5F5DEC',
//           tabBarStyle: {
//             display: route.name === '[id]' ? 'none' : 'flex',
//           },
//           tabBarLabelStyle: {
//             zIndex: 100,
//             paddingBottom: 5,
//           },
//         })}
//       >
//         <Tabs.Screen
//           name="home"
//           options={{
//             title: 'All Calls',
//             tabBarIcon: ({ color }) => (
//               <Ionicons name="call-outline" size={24} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="[id]"
//           options={{
//             title: 'Start a New Call',
//             unmountOnBlur: true,
//             header: () => null,
//             tabBarIcon: ({ color }) => {
//               return (
//                 <View
//                 style={{
//                   position: "absolute",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   top: -10,
//                   left: 20,
//                   right: 20,
//                   bottom: 0,
//                   margin: "auto",

//                   borderRadius: 50,
//                   zIndex: 100,
//                   backgroundColor:'white',
//                   borderColor: 'lightgray',
//                   borderWidth: 0.2,
//                   borderTopWidth: 1,
//                   borderBottomWidth: 0,
//                 }}>
//                   <FontAwesome
//                   name='plus-circle'
//                   size={30}
//                   color="black"
//                   style={{
//                     zIndex: 200,
//                   }}/>
//                 </View>
//               )
//             }

//           }}
//         />
//         <Tabs.Screen
//           name="join"
//           options={{
//             title: 'Join Call',
//             headerTitle: 'Enter the Room ID',
//             tabBarIcon: ({ color }) => (
//               <Ionicons name="enter-outline" size={24} color={color} />
//             ),
//           }}
//         />
//       </Tabs>
//     </SafeAreaView>
//   )
// }

// export default Layout

// const styles = StyleSheet.create({})