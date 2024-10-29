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
          <MaterialCommunityIcons name="exit-run" size={30} color="#fd0808" />
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

