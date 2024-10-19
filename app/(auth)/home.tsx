import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Dialog from 'react-native-dialog';
import { useNavigation } from '@react-navigation/native';

const HomePage = () => {
  const user = auth().currentUser;
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleSignOut = () => {
    setIsLoading(true);
    auth()
      .signOut()
      .then(() => {
        setIsLoading(false);
        setDialogueOpen(false);
        Alert.alert("Success", "You have signed out.");
      })
      .catch((error) => {
        setIsLoading(false);
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* Floating Button for opening the sign-out dialog (Top Right) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setDialogueOpen(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="exit-run" size={30} color="#f0540c" />
      </TouchableOpacity>

      {/* Dialog for confirming sign-out */}
      <Dialog.Container visible={dialogueOpen} contentStyle={styles.dialogContainer}>
        <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
        <Dialog.Description style={styles.dialogDescription}>
          Are you sure you want to sign out? You will need to log in again.
        </Dialog.Description>

        {/* Cancel and Sign Out buttons */}
        <View style={styles.dialogButtons}>
          <Dialog.Button
            label="Cancel"
            onPress={() => setDialogueOpen(false)}
            color="#007AFF"
          />
          <Dialog.Button
            label="Sign Out"
            onPress={handleSignOut}
            color="#ff3b30"
            disabled={isLoading}
          />
        </View>

        {/* Loading spinner while signing out */}
        {isLoading && (
          <ActivityIndicator size="large" color="#f0540c" style={styles.loadingIndicator} />
        )}
      </Dialog.Container>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Light background for a clean look
  },
  floatingButton: {
    position: 'absolute',
    top: 40, // Positioned at the top right
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  dialogContainer: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#fff',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dialogDescription: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
