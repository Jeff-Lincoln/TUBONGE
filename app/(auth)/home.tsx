import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  Switch,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons';
import Dialog from 'react-native-dialog';
import { useStreamVideoClient, Call } from '@stream-io/video-react-native-sdk';
import { formatSlug } from "@/lib/slugs";
import { useRouter } from 'expo-router';

const HomePage = () => {
  const user = auth().currentUser;
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMyCalls, setIsMyCalls] = useState(false);
  const [calls, setCalls] = useState<Call[]>([]);
  const client = useStreamVideoClient();
  const router = useRouter();

  const handleSignOut = () => {
    setIsLoading(true);
    auth()
      .signOut()
      .then(() => {
        setIsLoading(false);
        setDialogueOpen(false);
        Alert.alert("Success", "You have signed out successfully");
      })
      .catch((error) => {
        setIsLoading(false);
        Alert.alert("Error", error.message);
      });
  };

  const fetchCalls = async () => {
    if (!client || !user) return;
    const { calls } = await client.queryCalls({
      filter_conditions: isMyCalls
        ? {
            $or: [
              { created_by_user_id: user.uid },
              { members: { $in: [user.uid] } },
            ],
          }
        : {},
      sort: [{ field: "created_at", direction: -1 }],
      watch: true,
    });
    setCalls(calls);
  };

  useEffect(() => {
    fetchCalls();
  }, [isMyCalls]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCalls();
    setIsRefreshing(false);
  };

  const handleJoinRoom = (id: string) => {
    router.push(`/(auth)/${id}`);
  };

  const renderCallItem = ({ item }: { item: Call }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleJoinRoom(item.id)}
      disabled={item.state.participantCount === 0}
      style={[
        styles.callItem,
        item.state.participantCount === 0 && styles.callItemDisabled,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.callItemContent}>
        <Image
          source={require('@/assets/images/newProfile.jpg')}
          style={styles.profileImage}
        />

        <View style={styles.callDetails}>
          <Text style={styles.callTitle}>
            {item.state.createdBy?.name || 
             (item.state.createdBy?.custom?.email 
              ? item.state.createdBy.custom.email.split("@")[0] 
              : "Unknown User")}
          </Text>
          <Text style={styles.callEmail}>
            {item.state.createdBy?.custom?.email || "No Email Available"}
          </Text>
          <Text style={styles.callId}>
            ID: {formatSlug(item.id)}
          </Text>
        </View>

        <View style={styles.participantContainer}>
          {item.state.participantCount === 0 ? (
            <View style={styles.endedBadge}>
              <Text style={styles.callEnded}>Ended</Text>
            </View>
          ) : (
            <View style={styles.participantBadge}>
              <Entypo name="users" size={14} color="#fff" />
              <Text style={styles.participantCount}>
                {item.state.participantCount}
              </Text>
            </View>
          )}
          <View style={styles.callIconContainer}>
            <Feather 
              name="phone-call" 
              size={20} 
              color={item.state.participantCount === 0 ? "#999" : "#5F5DEC"} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video Calls</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => setDialogueOpen(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="exit-run" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>

      {/* Filter Switch */}
      <View style={styles.switchContainer}>
        <TouchableOpacity 
          onPress={() => setIsMyCalls(false)}
          style={[styles.switchTab, !isMyCalls && styles.activeTab]}
        >
          <Text style={[styles.switchText, !isMyCalls && styles.activeText]}>
            All Calls
          </Text>
        </TouchableOpacity>

        <Switch
          trackColor={{ false: "#dee2e6", true: "#5F5DEC" }}
          thumbColor={isMyCalls ? "#fff" : "#fff"}
          ios_backgroundColor="#dee2e6"
          onValueChange={() => setIsMyCalls(!isMyCalls)}
          value={isMyCalls}
          style={styles.switch}
        />

        <TouchableOpacity 
          onPress={() => setIsMyCalls(true)}
          style={[styles.switchTab, isMyCalls && styles.activeTab]}
        >
          <Text style={[styles.switchText, isMyCalls && styles.activeText]}>
            My Calls
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calls List */}
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={renderCallItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Sign Out Dialog */}
      <Dialog.Container visible={dialogueOpen} contentStyle={styles.dialogContainer}>
        <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
        <Dialog.Description style={styles.dialogDescription}>
          Are you sure you want to sign out?
        </Dialog.Description>

        <View style={styles.dialogButtons}>
          <Dialog.Button
            label="Cancel"
            onPress={() => setDialogueOpen(false)}
            color="#6c757d"
          />
          <Dialog.Button
            label="Sign Out"
            onPress={handleSignOut}
            color="#dc3545"
            disabled={isLoading}
          />
        </View>

        {isLoading && (
          <ActivityIndicator size="large" color="#5F5DEC" style={styles.loadingIndicator} />
        )}
      </Dialog.Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  switchTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f2ff',
  },
  switchText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeText: {
    color: '#5F5DEC',
    fontWeight: '600',
  },
  switch: {
    marginHorizontal: 12,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  listContainer: {
    padding: 16,
  },
  callItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  callItemDisabled: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  callItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  callDetails: {
    flex: 1,
    marginRight: 12,
  },
  callTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  callEmail: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 2,
  },
  callId: {
    fontSize: 12,
    color: '#adb5bd',
  },
  participantContainer: {
    alignItems: 'center',
  },
  endedBadge: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  callEnded: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  participantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5F5DEC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  participantCount: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  callIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  dialogContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default HomePage;



// import {
//   Button,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Switch,
//   Image,
// } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import auth from '@react-native-firebase/auth';
// import { MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons';
// import Dialog from 'react-native-dialog';
// import { useNavigation } from '@react-navigation/native';
// import { useStreamVideoClient, Call } from '@stream-io/video-react-native-sdk';
// import { formatSlug } from "@/lib/slugs";
// import { useRouter } from 'expo-router';

// const HomePage = () => {
//   const user = auth().currentUser;
//   const [dialogueOpen, setDialogueOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isMyCalls, setIsMyCalls] = useState(false);
//   const [calls, setCalls] = useState<Call[]>([]);
//   const client = useStreamVideoClient();
//   const router = useRouter();

//   const handleSignOut = () => {
//     setIsLoading(true);
//     auth()
//       .signOut()
//       .then(() => {
//         setIsLoading(false);
//         setDialogueOpen(false);
//         Alert.alert("Success", "You have signed out.");
//       })
//       .catch((error) => {
//         setIsLoading(false);
//         Alert.alert("Error", error.message);
//       });
//   };

//   const fetchCalls = async () => {
//     if (!client || !user) return;
//     const { calls } = await client.queryCalls({
//       filter_conditions: isMyCalls
//         ? {
//             $or: [
//               { created_by_user_id: user.uid },
//               { members: { $in: [user.uid] } },
//             ],
//           }
//         : {},
//       sort: [{ field: "created_at", direction: -1 }],
//       watch: true,
//     });
//     setCalls(calls);
//   };

//   useEffect(() => {
//     fetchCalls();
//   }, [isMyCalls]);

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await fetchCalls();
//     setIsRefreshing(false);
//   };

//   const handleJoinRoom = (id: string) => {
//     router.push(`/(auth)/${id}`);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Floating Button for opening the sign-out dialog */}
//       <TouchableOpacity
//         style={styles.floatingButton}
//         onPress={() => setDialogueOpen(true)}
//         activeOpacity={0.8}
//       >
//         <MaterialCommunityIcons name="exit-run" size={30} color="#f0540c" />
//       </TouchableOpacity>

//       {/* Switch to toggle between All Calls and My Calls */}
//       <View style={styles.switchContainer}>
//         <Text
//           style={{
//             color: isMyCalls ? "black" : '#5F5DEC',
//             fontWeight: isMyCalls ? "normal" : "bold",
//           }}
//           onPress={() => setIsMyCalls(false)}
//         >
//           All Calls
//         </Text>

//         <Switch
//           trackColor={{ false: "#5F5DEC", true: "#5F5DEC" }}
//           thumbColor="white"
//           ios_backgroundColor="#5F5DEC"
//           onValueChange={() => setIsMyCalls(!isMyCalls)}
//           value={isMyCalls}
//         />

//         <Text
//           style={{
//             color: isMyCalls ? '#5F5DEC' : "black",
//             fontWeight: isMyCalls ? "bold" : "normal",
//           }}
//           onPress={() => setIsMyCalls(true)}
//         >
//           My Calls
//         </Text>
//       </View>

//       {/* FlatList to show calls */}
//       <FlatList
//         data={calls}
//         keyExtractor={(item) => item.id}
//         refreshing={isRefreshing}
//         onRefresh={handleRefresh}
//         contentContainerStyle={styles.listContainer}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             key={item.id}
//             onPress={() => handleJoinRoom(item.id)}
//             disabled={item.state.participantCount === 0}
//             style={[
//               styles.callItem,
//               item.state.participantCount === 0 && styles.callItemDisabled,
//             ]}
//           >
//             <Image
//           source={require('@/assets/images/newProfile.jpg')} // Replace with the path to your local fallback image
//           style={styles.profileImage}
//             />

//             <View style={styles.callDetails}>
//               <Text style={styles.callTitle}>
//                 {item.state.createdBy?.name || (item.state.createdBy?.custom?.email ? item.state.createdBy.custom.email.split("@")[0] : "Unknown User")}
//               </Text>
//               <Text style={styles.callEmail}>
//                 {item.state.createdBy?.custom?.email || "No Email Available"}
//               </Text>
//               <Text style={styles.callId}>
//                 {formatSlug(item.id)}
//               </Text>
//             </View>

//             <View style={styles.participantContainer}>
//               {item.state.participantCount === 0 ? (
//                 <Text style={styles.callEnded}>Call Ended</Text>
//               ) : (
//                 <View style={styles.participantBadge}>
//                   <Entypo name="users" size={14} color="#fff" />
//                   <Text style={styles.participantCount}>
//                     {item.state.participantCount}
//                   </Text>
//                 </View>
//               )}
//               <Feather name="phone-call" size={20} color="gray" />
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Dialog for confirming sign-out */}
//       <Dialog.Container visible={dialogueOpen} contentStyle={styles.dialogContainer}>
//         <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
//         <Dialog.Description style={styles.dialogDescription}>
//           Are you sure you want to sign out? You will need to log in again.
//         </Dialog.Description>

//         <View style={styles.dialogButtons}>
//           <Dialog.Button
//             label="Cancel"
//             onPress={() => setDialogueOpen(false)}
//             color="#007AFF"
//           />
//           <Dialog.Button
//             label="Sign Out"
//             onPress={handleSignOut}
//             color="#ff3b30"
//             disabled={isLoading}
//           />
//         </View>

//         {isLoading && (
//           <ActivityIndicator size="large" color="#f0540c" style={styles.loadingIndicator} />
//         )}
//       </Dialog.Container>
//     </View>
//   );
// };

// export default HomePage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   floatingButton: {
//     position: 'absolute',
//     top: 8,
//     right: 15,
//     backgroundColor: '#fff',
//     borderRadius: 30,
//     padding: 13,
//     shadowColor: '#230bf8',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.9,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   switchContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 15,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginVertical: 10,
//     elevation: 3,
//     shadowColor: '#230bf8',
//   },
//   listContainer: {
//     marginTop: 10,
//     paddingHorizontal: 12,
//   },
//   callItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "#fff",
//     marginBottom: 8,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   callItemDisabled: {
//     backgroundColor: "#e0e0e0",
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   callDetails: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   callTitle: {
//     fontWeight: "bold",
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   callEmail: {
//     fontSize: 12,
//     color: "#888",
//   },
//   callId: {
//     fontSize: 10,
//     color: "#555",
//   },
//   participantContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   callEnded: {
//     fontSize: 10,
//     color: "#e63946",
//   },
//   participantBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#5F5DEC",
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 5,
//     marginBottom: 4,
//   },
//   participantCount: {
//     color: "#fff",
//     fontWeight: "bold",
//     marginLeft: 6,
//   },
//   dialogContainer: {
//     borderRadius: 10,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   dialogTitle: {
//     fontWeight: "bold",
//     fontSize: 18,
//     textAlign: "center",
//   },
//   dialogDescription: {
//     fontSize: 14,
//     color: "#333",
//     textAlign: "center",
//     marginVertical: 10,
//   },
//   dialogButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 15,
//   },
//   loadingIndicator: {
//     marginTop: 10,
//   },
// });




// // import {
// //   Button,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// //   ActivityIndicator,
// //   Alert,
// //   FlatList,
// //   Switch,
// //   Image,
// // } from 'react-native';
// // import React, { useState, useEffect } from 'react';
// // import auth from '@react-native-firebase/auth';
// // import { MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons';
// // import Dialog from 'react-native-dialog';
// // import { useNavigation } from '@react-navigation/native';
// // import { useStreamVideoClient, Call } from '@stream-io/video-react-native-sdk';
// // import { formatSlug } from "@/lib/slugs";
// // import { useRouter } from 'expo-router';

// // const HomePage = () => {
// //   const user = auth().currentUser;
// //   const [dialogueOpen, setDialogueOpen] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isRefreshing, setIsRefreshing] = useState(false);
// //   const [isMyCalls, setIsMyCalls] = useState(false);
// //   const [calls, setCalls] = useState<Call[]>([]);
// //   const client = useStreamVideoClient();
// //   const router = useRouter();

// //   const handleSignOut = () => {
// //     setIsLoading(true);
// //     auth()
// //       .signOut()
// //       .then(() => {
// //         setIsLoading(false);
// //         setDialogueOpen(false);
// //         Alert.alert("Success", "You have signed out.");
// //       })
// //       .catch((error) => {
// //         setIsLoading(false);
// //         Alert.alert("Error", error.message);
// //       });
// //   };

// //   const fetchCalls = async () => {
// //     if (!client || !user) return;
// //     const { calls } = await client.queryCalls({
// //       filter_conditions: isMyCalls
// //         ? {
// //             $or: [
// //               { created_by_user_id: user.uid },
// //               { members: { $in: [user.uid] } },
// //             ],
// //           }
// //         : {},
// //       sort: [{ field: "created_at", direction: -1 }],
// //       watch: true,
// //     });
// //     setCalls(calls);
// //   };

// //   useEffect(() => {
// //     fetchCalls();
// //   }, [isMyCalls]);

// //   const handleRefresh = async () => {
// //     setIsRefreshing(true);
// //     await fetchCalls();
// //     setIsRefreshing(false);
// //   };

// //   const handleJoinRoom = (id: string) => {
// //     router.push(`/(auth)/${id}`);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       {/* Floating Button for opening the sign-out dialog */}
// //       <TouchableOpacity
// //         style={styles.floatingButton}
// //         onPress={() => setDialogueOpen(true)}
// //         activeOpacity={0.8}
// //       >
// //         <MaterialCommunityIcons name="exit-run" size={30} color="#f0540c" />
// //       </TouchableOpacity>

// //       {/* Switch to toggle between All Calls and My Calls */}
// //       <View style={styles.switchContainer}>
// //         <Text
// //           style={{
// //             color: isMyCalls ? "black" : '#5F5DEC',
// //             fontWeight: isMyCalls ? "normal" : "bold",
// //           }}
// //           onPress={() => setIsMyCalls(false)}
// //         >
// //           All Calls
// //         </Text>

// //         <Switch
// //           trackColor={{ false: "#5F5DEC", true: "#5F5DEC" }}
// //           thumbColor="white"
// //           ios_backgroundColor="#5F5DEC"
// //           onValueChange={() => setIsMyCalls(!isMyCalls)}
// //           value={isMyCalls}
// //         />

// //         <Text
// //           style={{
// //             color: isMyCalls ? '#5F5DEC' : "black",
// //             fontWeight: isMyCalls ? "bold" : "normal",
// //           }}
// //           onPress={() => setIsMyCalls(true)}
// //         >
// //           My Calls
// //         </Text>
// //       </View>

// //       {/* FlatList to show calls */}
// //       <FlatList
// //         data={calls}
// //         keyExtractor={(item) => item.id}
// //         refreshing={isRefreshing}
// //         onRefresh={handleRefresh}
// //         contentContainerStyle={styles.listContainer}
// //         renderItem={({ item }) => (
// //           <TouchableOpacity
// //             key={item.id}
// //             onPress={() => handleJoinRoom(item.id)}
// //             disabled={item.state.participantCount === 0}
// //             style={[
// //               styles.callItem,
// //               item.state.participantCount === 0 && styles.callItemDisabled,
// //             ]}
// //           >
// //             <Image
// //               source={{ uri: item.state.createdBy?.image }}
// //               style={styles.profileImage}
// //             />

// //             <View style={styles.callDetails}>
// //               <Text style={styles.callTitle}>
// //                 {item.state.createdBy?.name || item.state.createdBy?.custom.email.split("@")[0]}
// //               </Text>
// //               <Text style={styles.callEmail}>
// //                 {item.state.createdBy?.custom.email}
// //               </Text>
// //               <Text style={styles.callId}>
// //                 {formatSlug(item.id)}
// //               </Text>
// //             </View>

// //             <View style={styles.participantContainer}>
// //               {item.state.participantCount === 0 ? (
// //                 <Text style={styles.callEnded}>Call Ended</Text>
// //               ) : (
// //                 <View style={styles.participantBadge}>
// //                   <Entypo name="users" size={14} color="#fff" />
// //                   <Text style={styles.participantCount}>
// //                     {item.state.participantCount}
// //                   </Text>
// //                 </View>
// //               )}
// //               <Feather name="phone-call" size={20} color="gray" />
// //             </View>
// //           </TouchableOpacity>
// //         )}
// //       />

// //       {/* Dialog for confirming sign-out */}
// //       <Dialog.Container visible={dialogueOpen} contentStyle={styles.dialogContainer}>
// //         <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
// //         <Dialog.Description style={styles.dialogDescription}>
// //           Are you sure you want to sign out? You will need to log in again.
// //         </Dialog.Description>

// //         <View style={styles.dialogButtons}>
// //           <Dialog.Button
// //             label="Cancel"
// //             onPress={() => setDialogueOpen(false)}
// //             color="#007AFF"
// //           />
// //           <Dialog.Button
// //             label="Sign Out"
// //             onPress={handleSignOut}
// //             color="#ff3b30"
// //             disabled={isLoading}
// //           />
// //         </View>

// //         {isLoading && (
// //           <ActivityIndicator size="large" color="#f0540c" style={styles.loadingIndicator} />
// //         )}
// //       </Dialog.Container>
// //     </View>
// //   );
// // };

// // export default HomePage;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f5f5f5', // Light background for a clean look
// //   },
// //   floatingButton: {
// //     position: 'absolute',
// //     top: 8, // Positioned at the top right
// //     right: 15,
// //     backgroundColor: '#fff',
// //     borderRadius: 30,
// //     padding: 13,
// //     shadowColor: '#230bf8',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.9,
// //     shadowRadius: 3,
// //     elevation: 5,
// //   },
// //   switchContainer: {
// //     flexDirection: "row",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     backgroundColor: "#fff",
// //     paddingVertical: 15,
// //     paddingHorizontal: 16,
// //     borderRadius: 8,
// //     marginVertical: 10,
// //     elevation: 3,
// //     shadowColor: '#230bf8',

// //   },
// //   listContainer: {
// //     marginTop: 10,
// //     paddingHorizontal: 12,
// //   },
// //   callItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     padding: 12,
// //     backgroundColor: "#fff",
// //     marginBottom: 8,
// //     borderRadius: 8,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 6,
// //     elevation: 2,
// //   },
// //   callItemDisabled: {
// //     backgroundColor: "#e0e0e0",
// //   },
// //   profileImage: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     marginRight: 12,
// //   },
// //   callDetails: {
// //     flex: 1,
// //     justifyContent: "center",
// //   },
// //   callTitle: {
// //     fontWeight: "bold",
// //     fontSize: 14,
// //     marginBottom: 4,
// //   },
// //   callEmail: {
// //     fontSize: 12,
// //     color: "#888",
// //   },
// //   callId: {
// //     fontSize: 10,
// //     color: "#555",
// //   },
// //   participantContainer: {
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   callEnded: {
// //     fontSize: 10,
// //     color: "#e63946",
// //   },
// //   participantBadge: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#5F5DEC",
// //     paddingVertical: 4,
// //     paddingHorizontal: 8,
// //     borderRadius: 5,
// //     marginBottom: 4,
// //   },
// //   participantCount: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     marginLeft: 6,
// //   },
// //   dialogContainer: {
// //     borderRadius: 10,
// //     padding: 20,
// //     backgroundColor: '#fff',
// //   },
// //   dialogTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#000',
// //   },
// //   dialogDescription: {
// //     fontSize: 16,
// //     color: '#666',
// //     marginVertical: 10,
// //   },
// //   dialogButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 10,
// //   },
// //   loadingIndicator: {
// //     marginTop: 20,
// //   },
// // });



// // // import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
// // // import React, { useState } from 'react';
// // // import auth from '@react-native-firebase/auth';
// // // import { MaterialCommunityIcons } from '@expo/vector-icons';
// // // import Dialog from 'react-native-dialog';
// // // import { useNavigation } from '@react-navigation/native';
// // // import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';

// // // const HomePage = () => {
// // //   const user = auth().currentUser;
// // //   const [dialogueOpen, setDialogueOpen] = useState(false);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const client = useStreamVideoClient();


// // //   const handleSignOut = () => {
// // //     setIsLoading(true);
// // //     auth()
// // //       .signOut()
// // //       .then(() => {
// // //         setIsLoading(false);
// // //         setDialogueOpen(false);
// // //         Alert.alert("Success", "You have signed out.");
// // //       })
// // //       .catch((error) => {
// // //         setIsLoading(false);
// // //         Alert.alert("Error", error.message);
// // //       });
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       {/* Floating Button for opening the sign-out dialog (Top Right) */}
// // //       <TouchableOpacity
// // //         style={styles.floatingButton}
// // //         onPress={() => setDialogueOpen(true)}
// // //         activeOpacity={0.8}
// // //       >
// // //         <MaterialCommunityIcons name="exit-run" size={30} color="#f0540c" />
// // //       </TouchableOpacity>

// // //       {/* Dialog for confirming sign-out */}
// // //       <Dialog.Container visible={dialogueOpen} contentStyle={styles.dialogContainer}>
// // //         <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
// // //         <Dialog.Description style={styles.dialogDescription}>
// // //           Are you sure you want to sign out? You will need to log in again.
// // //         </Dialog.Description>

// // //         {/* Cancel and Sign Out buttons */}
// // //         <View style={styles.dialogButtons}>
// // //           <Dialog.Button
// // //             label="Cancel"
// // //             onPress={() => setDialogueOpen(false)}
// // //             color="#007AFF"
// // //           />
// // //           <Dialog.Button
// // //             label="Sign Out"
// // //             onPress={handleSignOut}
// // //             color="#ff3b30"
// // //             disabled={isLoading}
// // //           />
// // //         </View>

// // //         {/* Loading spinner while signing out */}
// // //         {isLoading && (
// // //           <ActivityIndicator size="large" color="#f0540c" style={styles.loadingIndicator} />
// // //         )}
// // //       </Dialog.Container>
// // //     </View>
// // //   );
// // // };

// // // export default HomePage;

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     // backgroundColor: '#fff'
// // //     backgroundColor: '#f5f5f5', // Light background for a clean look
// // //   },
// // //   floatingButton: {
// // //     position: 'absolute',
// // //     top: 10, // Positioned at the top right
// // //     right: 20,
// // //     backgroundColor: '#fff',
// // //     borderRadius: 30,
// // //     padding: 15,
// // //     shadowColor: '#230bf8',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     // shadowOpacity: 0.3,
// // //     shadowOpacity: 0.9,
// // //     shadowRadius: 3,
// // //     elevation: 5,
// // //   },
// // //   dialogContainer: {
// // //     borderRadius: 10,
// // //     padding: 20,
// // //     backgroundColor: '#fff',
// // //   },
// // //   dialogTitle: {
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //   },
// // //   dialogDescription: {
// // //     fontSize: 16,
// // //     color: '#666',
// // //     marginVertical: 10,
// // //   },
// // //   dialogButtons: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     marginTop: 10,
// // //   },
// // //   loadingIndicator: {
// // //     marginTop: 20,
// // //   },
// // // });


// // // // import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, FlatList, Image, Switch } from 'react-native';
// // // // import React, { useState, useEffect } from 'react';
// // // // import auth from '@react-native-firebase/auth';
// // // // import { MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons';
// // // // import Dialog from 'react-native-dialog';
// // // // import { useNavigation } from '@react-navigation/native';
// // // // import { formatSlug } from "../../lib/slugs";
// // // // import { Call, useStreamVideoClient } from "@stream-io/video-react-native-sdk";
// // // // import { useRouter } from "expo-router";

// // // // const HomePage = () => {
// // // //   const user = auth().currentUser;
// // // //   const router = useRouter();
// // // //   const client = useStreamVideoClient();

// // // //   const [dialogueOpen, setDialogueOpen] = useState(false);
// // // //   const [isLoading, setIsLoading] = useState(false);
// // // //   const [isRefreshing, setIsRefreshing] = useState(false);
// // // //   const [isMyCalls, setIsMyCalls] = useState(false);
// // // //   const [calls, setCalls] = useState<Call[]>([]);

// // // //   // Sign-out with Firebase
// // // //   const handleSignOut = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       await auth().signOut();  // Firebase sign-out
// // // //       setDialogueOpen(false);
// // // //       Alert.alert("Success", "You have signed out.");
// // // //     } catch (error: any) {
// // // //       Alert.alert("Error", error.message);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   // Fetch Calls
// // // //   const fetchCalls = async () => {
// // // //     if (!client || !user) return;

// // // //     const { calls } = await client.queryCalls({
// // // //       filter_conditions: isMyCalls
// // // //         ? { $or: [{ created_by_user_id: user.uid }, { members: { $in: [user.uid] } }] }
// // // //         : {},
// // // //       sort: [{ field: "created_at", direction: -1 }],
// // // //       watch: true,
// // // //     });
// // // //     setCalls(calls);
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchCalls();
// // // //   }, [isMyCalls]);

// // // //   const handleRefresh = async () => {
// // // //     setIsRefreshing(true);
// // // //     await fetchCalls();
// // // //     setIsRefreshing(false);
// // // //   };

// // // //   const handleJoinRoom = (id: string) => {
// // // //     router.push(`/(auth)/${id}`);
// // // //   };

// // // //   return (
// // // //     <View style={styles.container}>
// // // //       {/* Header Section with Switch between All Calls and My Calls */}
// // // //       <View style={styles.header}>
// // // //         <View style={styles.switchContainer}>
// // // //           <Text style={[styles.switchText, !isMyCalls && styles.activeSwitchText]} onPress={() => setIsMyCalls(false)}>
// // // //             All Calls
// // // //           </Text>
// // // //           <Switch
// // // //             trackColor={{ false: "#5F5DEC", true: "#5F5DEC" }}
// // // //             thumbColor="white"
// // // //             onValueChange={() => setIsMyCalls(!isMyCalls)}
// // // //             value={isMyCalls}
// // // //           />
// // // //           <Text style={[styles.switchText, isMyCalls && styles.activeSwitchText]} onPress={() => setIsMyCalls(true)}>
// // // //             My Calls
// // // //           </Text>
// // // //         </View>

// // // //         {/* Sign-out button */}
// // // //         <TouchableOpacity style={styles.signOutButton} onPress={() => setDialogueOpen(true)}>
// // // //           <MaterialCommunityIcons name="exit-run" size={24} color="#5F5DEC" />
// // // //         </TouchableOpacity>
// // // //       </View>

// // // //       {/* Sign-out Dialog */}
// // // //       <Dialog.Container visible={dialogueOpen}>
// // // //         <Dialog.Title>Sign-Out</Dialog.Title>
// // // //         <Dialog.Description>Are you sure you want to sign out?</Dialog.Description>
// // // //         <Dialog.Button label="Cancel" onPress={() => setDialogueOpen(false)} />
// // // //         <Dialog.Button label="Sign out" onPress={handleSignOut} />
// // // //         {isLoading && <ActivityIndicator size="large" color="#f0540c" style={styles.loadingIndicator} />}
// // // //       </Dialog.Container>

// // // //       {/* Calls List */}
// // // //       <FlatList
// // // //         data={calls}
// // // //         keyExtractor={(item) => item.id}
// // // //         refreshing={isRefreshing}
// // // //         onRefresh={handleRefresh}
// // // //         contentContainerStyle={styles.listContainer}
// // // //         renderItem={({ item }) => (
// // // //           <TouchableOpacity
// // // //             key={item.id}
// // // //             onPress={() => handleJoinRoom(item.id)}
// // // //             disabled={item.state.participantCount === 0}
// // // //             style={[styles.callItem, item.state.participantCount === 0 && styles.callItemDisabled]}
// // // //           >
// // // //             <Image source={{ uri: item.state.createdBy?.image }} style={styles.profileImage} />
// // // //             <View style={styles.callDetails}>
// // // //               <Text style={styles.callTitle}>
// // // //                 {item.state.createdBy?.name || item.state.createdBy?.custom.email.split("@")[0]}
// // // //               </Text>
// // // //               <Text style={styles.callEmail}>{item.state.createdBy?.custom.email}</Text>
// // // //               <Text style={styles.callId}>{formatSlug(item.id)}</Text>
// // // //             </View>
// // // //             <View style={styles.participantContainer}>
// // // //               {item.state.participantCount === 0 ? (
// // // //                 <Text style={styles.callEnded}>Call Ended</Text>
// // // //               ) : (
// // // //                 <View style={styles.participantBadge}>
// // // //                   <Entypo name="users" size={14} color="#fff" />
// // // //                   <Text style={styles.participantCount}>{item.state.participantCount}</Text>
// // // //                 </View>
// // // //               )}
// // // //               <Feather name="phone-call" size={20} color="gray" />
// // // //             </View>
// // // //           </TouchableOpacity>
// // // //         )}
// // // //       />
// // // //     </View>
// // // //   );
// // // // };

// // // // export default HomePage;

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: "#f5f5f5",
// // // //   },
// // // //   header: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-between",
// // // //     alignItems: "center",
// // // //     padding: 16,
// // // //     backgroundColor: "#ffffff",
// // // //     elevation: 5,
// // // //     shadowColor: "#000",
// // // //     shadowOffset: { width: 0, height: 4 },
// // // //     shadowOpacity: 0.2,
// // // //     shadowRadius: 4,
// // // //   },
// // // //   switchContainer: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //   },
// // // //   switchText: {
// // // //     fontSize: 16,
// // // //     color: "#888",
// // // //     marginHorizontal: 10,
// // // //   },
// // // //   activeSwitchText: {
// // // //     color: "#5F5DEC",
// // // //     fontWeight: "bold",
// // // //   },
// // // //   signOutButton: {
// // // //     backgroundColor: "#fff",
// // // //     borderRadius: 50,
// // // //     padding: 10,
// // // //     elevation: 2,
// // // //   },
// // // //   listContainer: {
// // // //     paddingHorizontal: 12,
// // // //     paddingTop: 10,
// // // //   },
// // // //   callItem: {
// // // //     flexDirection: "row",
// // // //     padding: 12,
// // // //     backgroundColor: "#fff",
// // // //     marginBottom: 8,
// // // //     borderRadius: 8,
// // // //     shadowColor: "#000",
// // // //     shadowOffset: { width: 0, height: 4 },
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 6,
// // // //     elevation: 2,
// // // //   },
// // // //   callItemDisabled: {
// // // //     backgroundColor: "#e0e0e0",
// // // //   },
// // // //   profileImage: {
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //     marginRight: 12,
// // // //   },
// // // //   callDetails: {
// // // //     flex: 1,
// // // //   },
// // // //   callTitle: {
// // // //     fontWeight: "bold",
// // // //     fontSize: 14,
// // // //     color: "#333",
// // // //   },
// // // //   callEmail: {
// // // //     fontSize: 12,
// // // //     color: "#888",
// // // //   },
// // // //   callId: {
// // // //     fontSize: 10,
// // // //     color: "#555",
// // // //   },
// // // //   participantContainer: {
// // // //     alignItems: "center",
// // // //   },
// // // //   callEnded: {
// // // //     fontSize: 10,
// // // //     color: "#e63946",
// // // //   },
// // // //   participantBadge: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     backgroundColor: "#5F5DEC",
// // // //     paddingVertical: 4,
// // // //     paddingHorizontal: 8,
// // // //     borderRadius: 5,
// // // //   },
// // // //   participantCount: {
// // // //     color: "#fff",
// // // //     marginLeft: 6,
// // // //   },
// // // //   loadingIndicator: {
// // // //     marginTop: 20,
// // // //   },
// // // // });

