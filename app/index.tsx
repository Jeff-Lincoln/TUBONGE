import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Platform,
  Keyboard,
} from "react-native";
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(0);
  const shakeAnim = new Animated.Value(0);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const signUp = async () => {
    if (!email || !password) {
      shakeError();
      return;
    }
    
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      showSuccessAnimation();
    } catch (err: any) {
      const error = err as FirebaseError;
      shakeError();
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      shakeError();
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      showSuccessAnimation();
    } catch (err: any) {
      const error = err as FirebaseError;
      shakeError();
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const showError = (message: string) => {
    // Custom error toast component could be added here
    alert(message);
  };

  const showSuccessAnimation = () => {
    // Success animation could be added here
    alert('Success!');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            { translateX: shakeAnim },
          ],
        },
      ]}>
        {!isKeyboardVisible && (
          <View style={{
            backgroundColor:'#'
          }}>
            <Image
              source={require('@/assets/images/video.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to Tubonge</Text>
            <Text style={styles.subtitle}>Connect with friends and family</Text>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor="#888"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor="#888"
              editable={!loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#d8632c" />
                <Text style={styles.loadingText}>Please wait...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.signUpButton]}
                  onPress={signUp}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.signInButton]}
                  onPress={signIn}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, styles.signInText]}>
                    Already have an account? Sign In
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logo: {
    width: Dimensions.get('window').width * 0.4,
    height: Dimensions.get('window').width * 0.4,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#d8632c",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonContainer: {
    marginTop: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButton: {
    backgroundColor: "#d8632c",
  },
  signInButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d8632c",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  signInText: {
    color: "#d8632c",
  },
});

