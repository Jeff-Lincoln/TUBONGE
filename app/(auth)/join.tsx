import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import React, { useState } from 'react';
import { inverseFormatSlug } from '../../lib/slugs';
import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useRouter } from 'expo-router';
import Toast from 'react-native-root-toast';

const Join = () => {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const client = useStreamVideoClient();
  const router = useRouter();

  const handleJoinRoom = () => {
    if (!roomId) {
      Toast.show("Please enter a room name", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        backgroundColor: '#ff4444',
        textColor: '#ffffff',
      });
      return;
    }

    const slug = inverseFormatSlug(roomId);
    setLoading(true);

    const call = client?.call("default", slug);

    call?.get()
      .then((callResponse) => {
        router.push(`/(auth)/${slug}`);
      })
      .catch(() => {
        Toast.show(
          "Room not found. Please check the name and try again.",
          {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            backgroundColor: '#ff4444',
            textColor: '#ffffff',
          }
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Join Meeting Room</Text>
            <Text style={styles.subtitle}>Enter a room name to connect with others</Text>
          </View>

          <View style={styles.inputSection}>
            <TextInput
              placeholder='eg: Black Purple Tiger'
              value={roomId}
              onChangeText={setRoomId}
              style={styles.input}
              placeholderTextColor="#666"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            onPress={handleJoinRoom}
            style={[
              styles.button,
              { opacity: loading ? 0.7 : 1 }
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Join Room</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Join;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  inputSection: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    padding: 20,
    fontSize: 16,
    color: '#333',
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#4b6cb7',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b6cb7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
