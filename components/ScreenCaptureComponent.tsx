import React from 'react';
import { View, Button, Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

const ScreenCaptureComponent = () => {
  // Function to start screen capturing
  const startScreenCapture = async () => {
    try {
      const channelId = await notifee.createChannel({
        id: 'screen_capture',
        name: 'Screen Capture',
        lights: false,
        vibration: false,
        importance: AndroidImportance.DEFAULT,
      });

      await notifee.displayNotification({
        title: 'Screen Capture',
        body: 'This notification will be here until you stop capturing.',
        android: {
          channelId,
          asForegroundService: true,
        },
      });

      // Start your screen capture logic here...
      console.log('Screen capturing started');

    } catch (err) {
      console.error('Error starting screen capture: ', err);
      Alert.alert('Error', 'Failed to start screen capturing.');
    }
  };

  // Function to stop screen capturing
  const stopScreenCapture = async () => {
    try {
      await notifee.stopForegroundService();
      console.log('Foreground service stopped successfully');
    } catch (err) {
      console.error('Error stopping foreground service: ', err);
      Alert.alert('Error', 'Failed to stop screen capturing.');
    }
  };

  // Registering the foreground service
  notifee.registerForegroundService(notification => {
    return new Promise(() => {
      // Handle your foreground service logic here
      // You can also manage the ongoing state, if needed
    });
  });

  return (
    <View>
      <Button title="Start Capture" onPress={startScreenCapture} />
      <Button title="Stop Capture" onPress={stopScreenCapture} />
    </View>
  );
};

export default ScreenCaptureComponent;
