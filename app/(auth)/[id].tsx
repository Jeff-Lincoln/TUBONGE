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
