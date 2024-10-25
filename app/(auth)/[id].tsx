import { ActivityIndicator, StyleSheet, Text, View, Dimensions, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import Room from '@/components/Room';
import { generateSlug } from "random-word-slugs";
import Toast from 'react-native-root-toast';
import { copySlug, formatSlug } from '@/lib/slugs';

const { width } = Dimensions.get('window');

const CallScreen = () => {
  const params = useLocalSearchParams();
  const id = params?.id;
  
  const [call, setCall] = useState<Call | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const client = useStreamVideoClient();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const initializeCall = async () => {
      if (!client) {
        setError('Connection failed');
        showToast('Unable to connect to video service');
        setLoading(false);
        return;
      }

      try {
        let callSlug: string;

        if (id && typeof id === 'string' && id !== 'call') {
          callSlug = id.toLowerCase().replace(/\s+/g, '-');
        } else {
          callSlug = generateSlug(3, {
            format: 'kebab',
            categories: {
              adjective: ['color', 'personality'],
              noun: ['food', 'science'],
            },
          });
        }

        const _call = client.call('default', callSlug);
        await _call.join({ create: id !== callSlug });
        setCall(_call);
        setSlug(callSlug);

        const message = id === callSlug 
          ? `Connected: ${formatSlug(callSlug)}`
          : `Room created: ${formatSlug(callSlug)}\nTap to copy code`;
        showToast(message);
        animateIn();

      } catch (error) {
        console.error("Call initialization error:", error);
        setError('Connection failed');
        showToast("Unable to connect. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeCall();

    return () => {
      if (call?.state.callingState !== CallingState.LEFT) {
        call?.leave();
      }
    };
  }, [id, client]);

  const showToast = (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      backgroundColor: '#1a1a1a',
      opacity: 0.95,
      containerStyle: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 40,
        width: width * 0.9,
        maxWidth: 400,
      },
      onPress: () => {
        if (slug) {
          copySlug(slug);
          Toast.show('Room code copied! 📋', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER,
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Connecting to room...</Text>
          <View style={styles.loadingProgress}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: '100%' }
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (error || !call || !slug) {
    return (
      <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Unable to Connect</Text>
          <Text style={styles.errorText}>
            Please check your connection and try again
          </Text>
          <View style={styles.errorTips}>
            <Text style={styles.errorTipText}>
              • Check your internet connection{'\n'}
              • Verify your room code{'\n'}
              • Refresh the application
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
      <StreamCall call={call}>
        <Room slug={slug} />
      </StreamCall>
    </Animated.View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingProgress: {
    width: width * 0.8,
    maxWidth: 300,
    marginTop: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  errorTips: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  errorTipText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
});

// import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
// import { useLocalSearchParams } from 'expo-router';
// import Room from '@/components/Room';
// import { generateSlug } from "random-word-slugs";
// import Toast from 'react-native-root-toast';
// import { copySlug, formatSlug } from '@/lib/slugs';

// const CallScreen = () => {
//   const params = useLocalSearchParams();
//   console.log("Raw params:", params); // Debug log
  
//   const id = params?.id;
//   console.log("Extracted ID:", id, typeof id); // Debug log

//   const [call, setCall] = useState<Call | null>(null);
//   const [slug, setSlug] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const client = useStreamVideoClient();

//   useEffect(() => {
//     console.log("useEffect triggered with id:", id); // Debug log
    
//     const initializeCall = async () => {
//       if (!client) {
//         console.log("No client available"); // Debug log
//         showToast('Video client not initialized');
//         setLoading(false);
//         return;
//       }

//       try {
//         let callSlug: string;

//         if (id && typeof id === 'string' && id !== 'call') {
//           console.log("Joining existing call with ID:", id); // Debug log
//           callSlug = id.toLowerCase().replace(/\s+/g, '-');
//         } else {
//           console.log("Generating new call slug"); // Debug log
//           callSlug = generateSlug(3, {
//             format: 'kebab',
//             categories: {
//               adjective: ['color', 'personality'],
//               noun: ['food', 'science'],
//             },
//           });
//         }

//         console.log("Final callSlug:", callSlug); // Debug log

//         const _call = client.call('default', callSlug);
//         await _call.join({ create: id !== callSlug });
//         setCall(_call);
//         setSlug(callSlug);

//         const message = id === callSlug 
//           ? `Joined: ${formatSlug(callSlug)}`
//           : `Created: ${formatSlug(callSlug)}. Tap to copy!`;
//         showToast(message);

//       } catch (error) {
//         console.error("Call initialization error:", error);
//         showToast("Failed to initialize the call. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeCall();

//     return () => {
//       if (call?.state.callingState !== CallingState.LEFT) {
//         console.log("Cleaning up call"); // Debug log
//         call?.leave();
//       }
//     };
//   }, [id, client]);

//   const showToast = (message: string) => {
//     console.log("Showing toast:", message); // Debug log
//     Toast.show(message, {
//       duration: Toast.durations.LONG,
//       position: Toast.positions.CENTER,
//       shadow: true,
//       animation: true,
//       backgroundColor: '#333',
//       textColor: '#fff',
//       onPress: () => {
//         if (slug) {
//           console.log("Toast pressed, copying slug:", slug); // Debug log
//           copySlug(slug);
//         }
//       },
//     });
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#f1c40f" />
//         <Text style={styles.loadingText}>Joining the call...</Text>
//       </View>
//     );
//   }

//   if (!call || !slug) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Unable to connect to the call. Please try again.</Text>
//       </View>
//     );
//   }

//   return (
//     <StreamCall call={call}>
//       <Room slug={slug} />
//     </StreamCall>
//   );
// };

// export default CallScreen;

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#2c3e50',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#ecf0f1',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#e74c3c',
//   },
//   errorText: {
//     color: '#ffffff',
//     fontSize: 18,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//     fontWeight: '500',
//   },
// });



// // import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// // import React, { useEffect, useState } from 'react';
// // import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
// // import { useLocalSearchParams } from 'expo-router';
// // import Room from '../../components/Room';
// // import { generateSlug } from 'random-word-slugs';
// // import Toast from 'react-native-root-toast';
// // import { copySlug } from '../../lib/slugs';

// // const CallScreen = () => {
// //   const { id } = useLocalSearchParams();
// //   const [call, setCall] = useState<Call | null>(null);
// //   const [slug, setSlug] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const client = useStreamVideoClient();

// //   useEffect(() => {
// //     const initializeCall = async () => {
// //       if (!client) {
// //         showToast('Video client not initialized. Please check your token.');
// //         setLoading(false);
// //         return;
// //       }

// //       let slug: string | null = null;

// //       try {
// //         if (id && id !== '(auth)') {
// //           // Ensure id is valid before proceeding
// //           slug = id?.toString() || '';

// //           if (slug) {
// //             const _call = client.call('default', slug);
// //             await _call.join({ create: false });
// //             showToast('Successfully joined the call!');
// //             setCall(_call);
// //           } else {
// //             throw new Error('Invalid call slug.');
// //           }
// //         } else {
// //           // Create a new call with a generated slug
// //           slug = generateSlug(3, {
// //             categories: {
// //               adjective: ['color', 'personality'],
// //               noun: ['food', 'science'],
// //             },
// //           });
// //           const _call = client.call('default', slug);
// //           await _call.join({ create: true });
// //           showToast('Call created successfully. Tap here to copy the call ID!');
// //           setCall(_call);
// //         }

// //         setSlug(slug);
// //       } catch (error) {
// //         console.error('Call initialization error:', error);
// //         showToast('Failed to initialize call. Please check your connection.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     initializeCall();

// //     return () => {
// //       // Clean up: Leave the call when the component unmounts
// //       if (call?.state.callingState !== CallingState.LEFT) {
// //         call?.leave();
// //       }
// //     };
// //   }, [id, client, call]);

// //   const showToast = (message: string) => {
// //     Toast.show(message, {
// //       duration: Toast.durations.LONG,
// //       position: Toast.positions.BOTTOM,
// //       shadow: true,
// //       animation: true,
// //       backgroundColor: '#333',
// //       onPress: async () => {
// //         if (slug) copySlug(slug);
// //       },
// //     });
// //   };

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#f1c40f" />
// //         <Text style={styles.loadingText}>Joining the call...</Text>
// //       </View>
// //     );
// //   }

// //   if (!call || !slug) {
// //     return (
// //       <View style={styles.errorContainer}>
// //         <Text style={styles.errorText}>Unable to connect to the call. Please try again.</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <StreamCall call={call}>
// //       <Room slug={slug} />
// //     </StreamCall>
// //   );
// // };

// // export default CallScreen;

// // const styles = StyleSheet.create({
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#2c3e50',
// //   },
// //   loadingText: {
// //     marginTop: 10,
// //     color: '#ecf0f1',
// //     fontSize: 18,
// //     fontWeight: '600',
// //   },
// //   errorContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#e74c3c',
// //   },
// //   errorText: {
// //     color: '#ffffff',
// //     fontSize: 18,
// //     textAlign: 'center',
// //     paddingHorizontal: 20,
// //     fontWeight: '500',
// //   },
// // });



// // // import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// // // import React, { useEffect, useState } from 'react';
// // // import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
// // // import { useLocalSearchParams } from 'expo-router';
// // // import Room from '../../components/Room';
// // // import { generateSlug } from 'random-word-slugs';
// // // import Toast from 'react-native-root-toast';
// // // import { copySlug } from '../../lib/slugs';

// // // const CallScreen = () => {
// // //   const { id } = useLocalSearchParams();
// // //   const [call, setCall] = useState<Call | null>(null);
// // //   const [slug, setSlug] = useState<string | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const client = useStreamVideoClient();

// // //   useEffect(() => {
// // //     const initializeCall = async () => {
// // //       if (!client) {
// // //         showToast('Video client not initialized. Please check your token.');
// // //         setLoading(false);
// // //         return;
// // //       }

// // //       let callSlug: string | null = null;

// // //       try {
// // //         if (id && id !== '(auth)') {
// // //           // Ensure id is valid and not undefined before proceeding
// // //           callSlug = id?.toString() || '';
          
// // //           if (callSlug) {
// // //             const _call = client.call('default', callSlug);
// // //             await _call.join({ create: false });
// // //             showToast('Successfully joined the call!');
// // //             setCall(_call);
// // //           } else {
// // //             throw new Error('Invalid call slug.');
// // //           }
// // //         } else {
// // //           // Create a new call with a generated slug
// // //           callSlug = generateSlug(3, {
// // //             categories: {
// // //               adjective: ['color', 'personality'],
// // //               noun: ['food', 'science'],
// // //             },
// // //           });
// // //           const _call = client.call('default', callSlug);
// // //           await _call.join({ create: true });
// // //           showToast('Call created successfully. Tap here to copy the call ID!');
// // //           setCall(_call);
// // //         }

// // //         setSlug(callSlug);
// // //       } catch (error) {
// // //         console.error('Call initialization error:', error);
// // //         showToast('Failed to initialize call. Please check your connection.');
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     initializeCall();

// // //     return () => {
// // //       // Clean up: Leave the call when the component unmounts
// // //       if (call?.state.callingState !== CallingState.LEFT) {
// // //         call?.leave();
// // //       }
// // //     };
// // //   }, [id, client]);

// // //   const showToast = (message: string) => {
// // //     Toast.show(message, {
// // //       duration: Toast.durations.LONG,
// // //       position: Toast.positions.BOTTOM,
// // //       shadow: true,
// // //       animation: true,
// // //       backgroundColor: '#333',
// // //       onPress: async () => {
// // //         if (slug) copySlug(slug);
// // //       },
// // //     });
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <View style={styles.loadingContainer}>
// // //         <ActivityIndicator size="large" color="#f1c40f" />
// // //         <Text style={styles.loadingText}>Joining the call...</Text>
// // //       </View>
// // //     );
// // //   }

// // //   if (!call || !slug) {
// // //     return (
// // //       <View style={styles.errorContainer}>
// // //         <Text style={styles.errorText}>Unable to connect to the call. Please try again.</Text>
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <StreamCall call={call}>
// // //       <Room slug={slug} />
// // //     </StreamCall>
// // //   );
// // // };

// // // export default CallScreen;

// // // const styles = StyleSheet.create({
// // //   loadingContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#2c3e50',
// // //   },
// // //   loadingText: {
// // //     marginTop: 10,
// // //     color: '#ecf0f1',
// // //     fontSize: 18,
// // //     fontWeight: '600',
// // //   },
// // //   errorContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#e74c3c',
// // //   },
// // //   errorText: {
// // //     color: '#ffffff',
// // //     fontSize: 18,
// // //     textAlign: 'center',
// // //     paddingHorizontal: 20,
// // //     fontWeight: '500',
// // //   },
// // // });



// // // // import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// // // // import React, { useEffect, useState } from 'react';
// // // // import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
// // // // import { useLocalSearchParams } from 'expo-router';
// // // // import Room from '../../components/Room';
// // // // import { generateSlug } from 'random-word-slugs';
// // // // import Toast from 'react-native-root-toast';
// // // // import { copySlug } from '../../lib/slugs';

// // // // const CallScreen = () => {
// // // //   const { id } = useLocalSearchParams();
// // // //   const [call, setCall] = useState<Call | null>(null);
// // // //   const [slug, setSlug] = useState<string | null>(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const client = useStreamVideoClient();

// // // //   useEffect(() => {
// // // //     const initializeCall = async () => {
// // // //       if (!client) {
// // // //         showToast('Video client not initialized. Please check your token.');
// // // //         setLoading(false);
// // // //         return;
// // // //       }

// // // //       let callSlug: string | null = null;

// // // //       try {
// // // //         if (id && id !== '(auth)') {
// // // //           // Ensure id is valid and not undefined before proceeding
// // // //           callSlug = id?.toString() || '';
          
// // // //           if (callSlug) {
// // // //             const _call = client.call('default', callSlug);
// // // //             await _call.join({ create: false });
// // // //             showToast('Successfully joined the call!');
// // // //             setCall(_call);
// // // //           } else {
// // // //             throw new Error('Invalid call slug.');
// // // //           }
// // // //         } else {
// // // //           // Create a new call with a generated slug
// // // //           callSlug = generateSlug(3, {
// // // //             categories: {
// // // //               adjective: ['color', 'personality'],
// // // //               noun: ['food', 'science'],
// // // //             },
// // // //           });
// // // //           const _call = client.call('default', callSlug);
// // // //           await _call.join({ create: true });
// // // //           showToast('Call created successfully. Tap here to copy the call ID!');
// // // //           setCall(_call);
// // // //         }

// // // //         setSlug(callSlug);
// // // //       } catch (error) {
// // // //         console.error('Call initialization error:', error);
// // // //         showToast('Failed to initialize call. Please check your connection.');
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     initializeCall();

// // // //     return () => {
// // // //       // Clean up: Leave the call when the component unmounts
// // // //       if (call?.state.callingState !== CallingState.LEFT) {
// // // //         call?.leave();
// // // //       }
// // // //     };
// // // //   }, [id, client]);

// // // //   const showToast = (message: string) => {
// // // //     Toast.show(message, {
// // // //       duration: Toast.durations.LONG,
// // // //       position: Toast.positions.BOTTOM,
// // // //       shadow: true,
// // // //       animation: true,
// // // //       backgroundColor: '#333',
// // // //       onPress: async () => {
// // // //         if (slug) copySlug(slug);
// // // //       },
// // // //     });
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <View style={styles.loadingContainer}>
// // // //         <ActivityIndicator size="large" color="#f1c40f" />
// // // //         <Text style={styles.loadingText}>Joining the call...</Text>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   if (!call || !slug) {
// // // //     return (
// // // //       <View style={styles.errorContainer}>
// // // //         <Text style={styles.errorText}>Unable to connect to the call. Please try again.</Text>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <StreamCall call={call}>
// // // //       <Room slug={slug} />
// // // //     </StreamCall>
// // // //   );
// // // // };

// // // // export default CallScreen;

// // // // const styles = StyleSheet.create({
// // // //   loadingContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#2c3e50',
// // // //   },
// // // //   loadingText: {
// // // //     marginTop: 10,
// // // //     color: '#ecf0f1',
// // // //     fontSize: 18,
// // // //     fontWeight: '600',
// // // //   },
// // // //   errorContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#e74c3c',
// // // //   },
// // // //   errorText: {
// // // //     color: '#ffffff',
// // // //     fontSize: 18,
// // // //     textAlign: 'center',
// // // //     paddingHorizontal: 20,
// // // //     fontWeight: '500',
// // // //   },
// // // // });




// // // // import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// // // // import React, { useEffect, useState } from 'react';
// // // // import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
// // // // import { useLocalSearchParams } from 'expo-router';
// // // // import Room from '../../components/Room';
// // // // import { generateSlug } from 'random-word-slugs';
// // // // import Toast from 'react-native-root-toast';
// // // // import { copySlug } from '../../lib/slugs';

// // // // const CallScreen = () => {
// // // //   const { id } = useLocalSearchParams();
// // // //   const [call, setCall] = useState<Call | null>(null);
// // // //   const [slug, setSlug] = useState<string | null>(null);
// // // //   const [loading, setLoading] = useState(true); // Loading state
// // // //   const client = useStreamVideoClient();

// // // //   useEffect(() => {
// // // //     const initializeCall = async () => {
// // // //       if (!client) {
// // // //         showToast('Video client not initialized. Please check your token.');
// // // //         setLoading(false);
// // // //         return;
// // // //       }

// // // //       let callSlug: string | null = null;

// // // //       try {
// // // //         if (id && id !== '(auth)') {
// // // //           // Joining an existing call
// // // //           callSlug = id.toString();
// // // //           const _call = client.call('default', callSlug);
// // // //           await _call.join({ create: false });
// // // //           showToast('Successfully joined the call!');
// // // //           setCall(_call);
// // // //         } else {
// // // //           // Creating a new call with generated slug
// // // //           callSlug = generateSlug(3, {
// // // //             categories: {
// // // //               adjective: ['color', 'personality'],
// // // //               noun: ['food', 'science'],
// // // //             },
// // // //           });
// // // //           const _call = client.call('default', callSlug);
// // // //           await _call.join({ create: true });
// // // //           showToast('Call created successfully. Tap here to copy the call ID!');
// // // //           setCall(_call);
// // // //         }

// // // //         setSlug(callSlug);
// // // //       } catch (error) {
// // // //         console.error('Call initialization error:', error);
// // // //         showToast('Failed to initialize call. Please check your connection.');
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     initializeCall();

// // // //     return () => {
// // // //       // Clean up: Leave the call when the component unmounts
// // // //       if (call?.state.callingState !== CallingState.LEFT) {
// // // //         call?.leave();
// // // //       }
// // // //     };
// // // //   }, [id, client]);

// // // //   const showToast = (message: string) => {
// // // //     Toast.show(message, {
// // // //       duration: Toast.durations.LONG,
// // // //       position: Toast.positions.BOTTOM,
// // // //       shadow: true,
// // // //       animation: true,
// // // //       backgroundColor: '#333',
// // // //       onPress: async () => {
// // // //         if (slug) copySlug(slug);
// // // //       },
// // // //     });
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <View style={styles.loadingContainer}>
// // // //         <ActivityIndicator size="large" color="#f1c40f" />
// // // //         <Text style={styles.loadingText}>Joining the call...</Text>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   if (!call || !slug) {
// // // //     return (
// // // //       <View style={styles.errorContainer}>
// // // //         <Text style={styles.errorText}>Unable to connect to the call. Please try again.</Text>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <StreamCall call={call}>
// // // //       <Room slug={slug} />
// // // //     </StreamCall>
// // // //   );
// // // // };

// // // // export default CallScreen;

// // // // const styles = StyleSheet.create({
// // // //   loadingContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#2c3e50', // Subtle dark background
// // // //   },
// // // //   loadingText: {
// // // //     marginTop: 10,
// // // //     color: '#ecf0f1', // Lighter color for better readability
// // // //     fontSize: 18,
// // // //     fontWeight: '600', // Bold text for emphasis
// // // //   },
// // // //   errorContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#e74c3c', // Use a vibrant red for error state
// // // //   },
// // // //   errorText: {
// // // //     color: '#ffffff',
// // // //     fontSize: 18,
// // // //     textAlign: 'center',
// // // //     paddingHorizontal: 20,
// // // //     fontWeight: '500', // Semi-bold text for error message
// // // //   },
// // // // });


// // // // // import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// // // // // import React, { useEffect, useState } from 'react';
// // // // // import { 
// // // // //   Call, 
// // // // //   CallingState, 
// // // // //   StreamCall, 
// // // // //   useStreamVideoClient 
// // // // // } from '@stream-io/video-react-native-sdk';
// // // // // import { useLocalSearchParams } from 'expo-router';
// // // // // import Toast from 'react-native-root-toast';

// // // // // const CallScreen = () => {
// // // // //   const [call, setCall] = useState<Call | null>(null);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const client = useStreamVideoClient();
// // // // //   const { id } = useLocalSearchParams();
// // // // //   const [slug, setSlug] = useState<string | null>(null);

// // // // //   useEffect(() => {
// // // // //     const initializeCall = async () => {
// // // // //       if (!client) {
// // // // //         showToast('Video client not initialized. Please check your token.');
// // // // //         setLoading(false);
// // // // //         return;
// // // // //       }

// // // // //       let callSlug: string;

// // // // //       try {
// // // // //         if (id && id !== '(auth)') {
// // // // //           // Join existing call
// // // // //           callSlug = id.toString();
// // // // //           const _call = client.call('default', callSlug);
// // // // //           await _call.join({ create: false });
// // // // //           showToast('Successfully joined the call!');
// // // // //           setCall(_call);
// // // // //         } else {
// // // // //           // Create new call
// // // // //           callSlug = 'demoroom'; // You can also use a random slug generator here
// // // // //           const _call = client.call('default', callSlug);
// // // // //           await _call.join({ create: true });
// // // // //           showToast('New call created successfully!');
// // // // //           setCall(_call);
// // // // //         }
// // // // //         setSlug(callSlug);
// // // // //       } catch (error) {
// // // // //         console.error('Call initialization error:', error);
// // // // //         showToast('Failed to initialize call. Please check your connection.');
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     initializeCall();

// // // // //     // Cleanup function
// // // // //     return () => {
// // // // //       if (call?.state.callingState !== CallingState.LEFT) {
// // // // //         call?.leave();
// // // // //       }
// // // // //     };
// // // // //   }, [id, client]);

// // // // //   const showToast = (message: string) => {
// // // // //     Toast.show(message, {
// // // // //       duration: Toast.durations.LONG,
// // // // //       position: Toast.positions.BOTTOM,
// // // // //       shadow: true,
// // // // //       animation: true,
// // // // //       backgroundColor: '#333',
// // // // //     });
// // // // //   };

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <View style={styles.centeredContainer}>
// // // // //         <ActivityIndicator size="large" color="#0000ff" />
// // // // //         <Text style={styles.loadingText}>Connecting to call...</Text>
// // // // //       </View>
// // // // //     );
// // // // //   }

// // // // //   if (!call || !slug) {
// // // // //     return (
// // // // //       <View style={styles.centeredContainer}>
// // // // //         <Text style={styles.errorText}>
// // // // //           Unable to connect to the call. Please check your connection and try again.
// // // // //         </Text>
// // // // //       </View>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <StreamCall call={call}>
// // // // //       <View style={styles.callContainer}>
// // // // //         {/* Add your call UI components here */}
// // // // //         <Text style={styles.callText}>Connected to call: {slug}</Text>
// // // // //       </View>
// // // // //     </StreamCall>
// // // // //   );
// // // // // };

// // // // // export default CallScreen;

// // // // // const styles = StyleSheet.create({
// // // // //   centeredContainer: {
// // // // //     flex: 1,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     padding: 20,
// // // // //     backgroundColor: '#f5f5f5',
// // // // //   },
// // // // //   loadingText: {
// // // // //     marginTop: 10,
// // // // //     fontSize: 16,
// // // // //     color: '#333',
// // // // //   },
// // // // //   errorText: {
// // // // //     fontSize: 16,
// // // // //     color: '#ff0000',
// // // // //     textAlign: 'center',
// // // // //   },
// // // // //   callContainer: {
// // // // //     flex: 1,
// // // // //     backgroundColor: '#fff',
// // // // //     padding: 20,
// // // // //   },
// // // // //   callText: {
// // // // //     fontSize: 16,
// // // // //     color: '#333',
// // // // //   },
// // // // // });


// // // // // // import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// // // // // // import React, { useEffect, useState } from 'react';
// // // // // // import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
// // // // // // import { useLocalSearchParams } from 'expo-router';
// // // // // // import Room from '../../components/Room';
// // // // // // import { generateSlug } from "random-word-slugs";
// // // // // // import Toast from 'react-native-root-toast';
// // // // // // import { copySlug } from '../../lib/slugs';

// // // // // // const CallScreen = () => {
// // // // // //   const { id } = useLocalSearchParams();
// // // // // //   const [call, setCall] = useState<Call | null>(null);
// // // // // //   const [slug, setSlug] = useState<string | null>(null);
// // // // // //   const [loading, setLoading] = useState(true); // Loading state
// // // // // //   const client = useStreamVideoClient();

// // // // // //   useEffect(() => {
// // // // // //     let slug: string;

// // // // // //     if (id !== "(auth)" && id) {
// // // // // //my directory is..."/app/(auth)/[id].tsx"
// // // // // //       // Joining an existing callss
// // // // // //       slug = id.toString();
// // // // // //       const _call = client?.call("default", slug);
// // // // // //       _call?.join({ create: false })
// // // // // //         .then(() => {
// // // // // //           setCall(_call);
// // // // // //           setLoading(false); // Stop loading after joining
// // // // // //         })
// // // // // //         .catch(() => {
// // // // // //           showToast("Failed to join call. Please try again.");
// // // // // //         });
// // // // // //     } else {
// // // // // //       // Creating a new call
// // // // // //       slug = generateSlug(3, {
// // // // // //         categories: {
// // // // // //           adjective: ["color", "personality"],
// // // // // //           noun: ["food", "science"],
// // // // // //         },
// // // // // //       });
// // // // // //       // slug = "demoroom"
// // // // // //       const _call = client?.call("default", slug);
// // // // // //       _call?.join({ create: true })
// // // // // //         .then(() => {
// // // // // //           showToast("Call Created Successfully. Tap here to copy the call ID!");
// // // // // //           setCall(_call);
// // // // // //           setLoading(false); // Stop loading after creating
// // // // // //         })
// // // // // //         .catch(() => {
// // // // // //           showToast("Failed to create call. Please try again.");
// // // // // //         });
// // // // // //     }

// // // // // //     setSlug(slug);
// // // // // //   }, [id, client]);

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       // Clean up: Leave the call when the component unmounts
// // // // // //       if (call?.state.callingState !== CallingState.LEFT) {
// // // // // //         call?.leave();
// // // // // //       }
// // // // // //     };
// // // // // //   }, [call]);

// // // // // //   const showToast = (message: string) => {
// // // // // //     Toast.show(message, {
// // // // // //       duration: Toast.durations.LONG,
// // // // // //       position: Toast.positions.CENTER,
// // // // // //       shadow: true,
// // // // // //       onPress: async () => {
// // // // // //         if (slug) copySlug(slug);
// // // // // //       },
// // // // // //     });
// // // // // //   };

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <View style={styles.loadingContainer}>
// // // // // //         <ActivityIndicator size="large" color="#f1c40f" />
// // // // // //         <Text style={styles.loadingText}>Joining the call...</Text>
// // // // // //       </View>
// // // // // //     );
// // // // // //   }

// // // // // //   if (!call || !slug) {
// // // // // //     return (
// // // // // //       <View style={styles.errorContainer}>
// // // // // //         <Text style={styles.errorText}>Unable to connect to the call. Please try again.</Text>
// // // // // //       </View>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <StreamCall call={call}>
// // // // // //       <Room slug={slug} />
// // // // // //     </StreamCall>
// // // // // //   );
// // // // // // };

// // // // // // export default CallScreen;

// // // // // // const styles = StyleSheet.create({
// // // // // //   loadingContainer: {
// // // // // //     flex: 1,
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //     backgroundColor: '#2c3e50', // Subtle dark background
// // // // // //   },
// // // // // //   loadingText: {
// // // // // //     marginTop: 10,
// // // // // //     color: '#ecf0f1', // Lighter color for better readability
// // // // // //     fontSize: 18,
// // // // // //     fontWeight: '600', // Bold text for emphasis
// // // // // //   },
// // // // // //   errorContainer: {
// // // // // //     flex: 1,
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //     backgroundColor: '#e74c3c', // Use a vibrant red for error state
// // // // // //   },
// // // // // //   errorText: {
// // // // // //     color: '#ffffff',
// // // // // //     fontSize: 18,
// // // // // //     textAlign: 'center',
// // // // // //     paddingHorizontal: 20,
// // // // // //     fontWeight: '500', // Semi-bold text for error message
// // // // // //   },
// // // // // // });

