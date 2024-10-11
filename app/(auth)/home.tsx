import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import auth from '@react-native-firebase/auth'

const HomePage = () => {
    const user = auth().currentUser;
  return (
    <View>
      <Text>Welcome back! {user?.email}</Text>
      <Button title="Sign out"
      onPress={() => auth().signOut()} />
    </View>
  )
}

export default HomePage

const styles = StyleSheet.create({})