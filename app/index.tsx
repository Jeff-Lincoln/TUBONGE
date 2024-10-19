<<<<<<< HEAD
<<<<<<< HEAD
import { Text, View } from "react-native";
=======
=======
>>>>>>> streamsdk-branch
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
<<<<<<< HEAD
>>>>>>> f5199ab (added streamsdk dep)

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
=======

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      alert('Check Your Emails!');
    } catch (err: any) {
      const error = err as FirebaseError;
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      alert('Logged In Successfully!');
    } catch (err: any) {
      const error = err as FirebaseError;
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo or Image */}
      <Image
        source={require('@/assets/images/icon_image.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Welcome to Tubonge</Text>

      <KeyboardAvoidingView behavior="padding" style={styles.formContainer}>
        {/* Email Input */}
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#888"
        />
        {/* Password Input */}
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#888"
        />

        {/* Buttons or Loading Indicator */}
        {loading ? (
          <ActivityIndicator size="large" color="#d8632c" style={styles.loader} />
        ) : (
          <>
            <View style={{
              padding: 10,
              marginBottom: 20,

            }}>
            <TouchableOpacity style={[styles.button, styles.createButton]} onPress={signUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={signIn}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  logo: {
    width: '100%',
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#d8632c",
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    marginVertical: 10,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fafafa",
  },
  loader: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#d8632c",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#34c759",
  },
});



// import { useState } from "react";
// import { ActivityIndicator, Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// import auth from '@react-native-firebase/auth';
// import { FirebaseError } from 'firebase/app'


// export default function Index() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const signUp = async () => {
//     setLoading(true);

//     try {
//       await auth().createUserWithEmailAndPassword(email, password);
//       alert('Check Your Emails!')
//     } catch (err: any) {
//       const error = err as FirebaseError;
//       alert("Registration failed: " + error.message)
//     } finally {
//       setLoading(false)
//     }
//   };

//   const signIn = async () => {
//     setLoading(true);

//     try {
//       await auth().createUserWithEmailAndPassword(email, password);
//       alert('Check Your Emails!')
//     } catch (err: any) {
//       const error = err as FirebaseError;
//       alert("Registration failed: " + error.message)
//     } finally {
//       setLoading(false)
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Title */}
//       <Text style={styles.title}>Tubonge</Text>

//       <KeyboardAvoidingView behavior="padding" style={styles.formContainer}>
//         {/* Email Input */}
//         <TextInput
//           style={styles.input}
//           value={email}
//           onChangeText={setEmail}
//           autoCapitalize="none"
//           keyboardType="email-address"
//           placeholder="Email"
//           placeholderTextColor="#666"
//         />
//         {/* Password Input */}
//         <TextInput
//           style={styles.input}
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           placeholder="Password"
//           placeholderTextColor="#666"
//         />

//         {/* Buttons or Loading Indicator */}
//         {loading ? (
//           <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
//         ) : (
//           <>
//             <TouchableOpacity style={styles.button} onPress={signIn}>
//               <Text style={styles.buttonText}>Sign In</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.button, styles.createButton]} onPress={signUp}>
//               <Text style={styles.buttonText}>Create Account</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#f5f5f5",
//     padding: 20,
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: "700",
//     color: "#007bff",
//     textAlign: "center",
//     marginBottom: 40,
//   },
//   formContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   input: {
//     marginVertical: 10,
//     height: 50,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     backgroundColor: "#fafafa",
//   },
//   loader: {
//     marginVertical: 20,
//   },
//   button: {
//     backgroundColor: "#007bff",
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginTop: 20,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   createButton: {
//     backgroundColor: "#28a745",
//   },
// });
>>>>>>> streamsdk-branch
