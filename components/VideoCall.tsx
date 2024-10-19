import React, { useEffect, useRef, useState } from 'react';
import { Button, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

const signalingServerUrl = 'ws://192.168.x.x:8000/ws/call/room1/'; // Use your Django server IP here
const peerConnectionConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function VideoCall() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const peerConnection = useRef<RTCPeerConnection>(new RTCPeerConnection(peerConnectionConfig));

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(signalingServerUrl);
    setSocket(ws);

    // WebSocket event handlers
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      if (data.type === 'offer') {
        // Handle WebRTC offer received
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        // Send WebRTC answer back to server
        ws.send(JSON.stringify({ type: 'answer', answer }));
      }

      if (data.type === 'answer') {
        // Handle WebRTC answer received
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }

      if (data.type === 'candidate') {
        // Add received ICE candidate
        const candidate = new RTCIceCandidate(data.candidate);
        await peerConnection.current.addIceCandidate(candidate);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Start call - send offer
  const startCall = async () => {
    setLoading(true); // Show loading when starting the call
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    // Send WebRTC offer to server
    socket?.send(JSON.stringify({ type: 'offer', offer }));
    setLoading(false); // Hide loading once the call has started
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Call</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Setting up the call...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.callButton} onPress={startCall}>
          <Text style={styles.buttonText}>Start Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
  },
});



// import React, { useEffect, useRef, useState } from 'react';
// import { Button, View, Text, StyleSheet } from 'react-native';
// import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

// const signalingServerUrl = 'ws://192.168.x.x:8000/ws/call/room1/'; // Use your Django server IP here
// const peerConnectionConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// export default function VideoCall() {
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const peerConnection = useRef<RTCPeerConnection>(new RTCPeerConnection(peerConnectionConfig));

//   useEffect(() => {
//     // Create WebSocket connection
//     const ws = new WebSocket(signalingServerUrl);
//     setSocket(ws);

//     // WebSocket event handlers
//     ws.onopen = () => {
//       console.log('WebSocket connected');
//     };

//     ws.onmessage = async (event) => {
//       const data = JSON.parse(event.data);
//       console.log('Received message:', data);

//       if (data.type === 'offer') {
//         // Handle WebRTC offer received
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);

//         // Send WebRTC answer back to server
//         ws.send(JSON.stringify({ type: 'answer', answer }));
//       }

//       if (data.type === 'answer') {
//         // Handle WebRTC answer received
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
//       }

//       if (data.type === 'candidate') {
//         // Add received ICE candidate
//         const candidate = new RTCIceCandidate(data.candidate);
//         await peerConnection.current.addIceCandidate(candidate);
//       }
//     };

//     ws.onclose = () => {
//       console.log('WebSocket disconnected');
//     };

//     // Cleanup WebSocket connection on component unmount
//     return () => {
//       ws.close();
//     };
//   }, []);

//   // Start call - send offer
//   const startCall = async () => {
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);

//     // Send WebRTC offer to server
//     socket?.send(JSON.stringify({ type: 'offer', offer }));
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Video Call</Text>
//       <Button title="Start Call" onPress={startCall} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
// });
