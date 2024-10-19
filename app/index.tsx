<<<<<<< HEAD
import { Text, View } from "react-native";
=======
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
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
