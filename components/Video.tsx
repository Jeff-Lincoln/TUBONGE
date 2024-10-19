import React from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MediaStream, RTCView } from 'react-native-webrtc';

interface Props {
    hangUp: () => void;
    localStream?: MediaStream | null;
    remoteStream?: MediaStream | null;
}

const ButtonContainer: React.FC<Props> = ({ hangUp }) => {
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={hangUp} style={styles.hangupButton}>
                <Text style={styles.hangupText}>Hang Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const Video: React.FC<Props> = ({ localStream, remoteStream, hangUp }) => {
    return (
        <View style={styles.container}>
            {/* Display local stream if no remote stream is connected */}
            {localStream && !remoteStream && (
                <RTCView
                    streamURL={localStream.toURL()}
                    objectFit="cover"
                    style={styles.video}
                />
            )}
            
            {/* Display both local and remote streams once call is connected */}
            {localStream && remoteStream && (
                <>
                    <RTCView
                        streamURL={remoteStream.toURL()}
                        objectFit="cover"
                        style={styles.video}
                    />
                    <RTCView
                        streamURL={localStream.toURL()}
                        objectFit="cover"
                        style={styles.localVideo}
                    />
                </>
            )}

            {/* Display the Hang Up button */}
            <ButtonContainer hangUp={hangUp} />
        </View>
    );
};

export default Video;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingBottom: 20,
    },
    video: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
    },
    localVideo: {
        position: 'absolute',
        height: 150,
        width: 100,
        top: 20,
        left: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
        elevation: 10,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%',
    },
    hangupButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    hangupText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});



// import React from 'react';
// import { Button, StyleSheet, Text, View } from 'react-native';
// import { MediaStream, RTCView } from 'react-native-webrtc';

// interface Props {
//     hangUp: () => void;
//     localStream?: MediaStream | null;
//     remoteStream?: MediaStream | null;
// }

// const ButtonContainer: React.FC<Props> = ({ hangUp }) => {
//     return (
//         <View style={styles.buttonContainer}>
//             <Button 
//                 onPress={hangUp}
//                 title="Hang Up"
//                 color="red"
//             />
//         </View>
//     );
// };

// const Video: React.FC<Props> = ({ localStream, remoteStream, hangUp }) => {
//     return (
//         <View style={styles.container}>
//             {/* Display local stream if no remote stream is connected */}
//             {localStream && !remoteStream && (
//                 <RTCView
//                     streamURL={localStream.toURL()}
//                     objectFit="cover"
//                     style={styles.video}
//                 />
//             )}
            
//             {/* Display both local and remote streams once call is connected */}
//             {localStream && remoteStream && (
//                 <>
//                     <RTCView
//                         streamURL={remoteStream.toURL()}
//                         objectFit="cover"
//                         style={styles.video}
//                     />
//                     <RTCView
//                         streamURL={localStream.toURL()}
//                         objectFit="cover"
//                         style={styles.localVideo}
//                     />
//                 </>
//             )}

//             {/* Display the Hang Up button */}
//             <ButtonContainer hangUp={hangUp} />
//         </View>
//     );
// };

// export default Video;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         marginBottom: 40,
//     },
//     video: {
//         position: 'absolute',
//         height: '100%',
//         width: '100%',
//     },
//     localVideo: {
//         position: 'absolute',
//         height: 100,
//         width: 150,
//         top: 20,
//         left: 20,
//         elevation: 10,
//     },
//     buttonContainer: {
//         marginBottom: 10,
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         borderRadius: 5,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         elevation: 5,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.8,
//         shadowRadius: 2,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });



// import { Button, StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import { MediaStream, RTCView } from 'react-native-webrtc'

// interface Props {
//     hangUp: () => void;
//     localStream?: MediaStream | null;
//     remoteStream?: MediaStream | null;
// }

// function ButtonContainer(props: Props) {
//     return (
//         <View>
//             <Button iconName="phone" backgroundColor="red" 
//             onPress={props.hangUp}
//             title="Hang Up"/>
//         </View>
//     )
// }

// const Video = (props: Props) => {
//     //On call we will just display the localstream
//     if (props.localStream && !props.remoteStream) {
//         return <View style={styles.container}>
//             <RTCView streamURL={props.localStream.toURL()}
//             objectFit={'cover'}
//             style={styles.video}/>
//              <ButtonContainer hangUp={props.hangUp}/>
//         </View>
//     }
//     //Once the call is connected we will display
//     //local stream on top of remote stream
//     if (props.localStream && props.remoteStream) {
//         return <View style={styles.container}>
//             <RTCView streamURL={props.remoteStream.toURL()}
//             objectFit={'cover'}
//             style={styles.video}/>
//             <RTCView streamURL={props.localStream.toURL()}
//             objectFit={'cover'}
//             style={styles.videoLocal}/>
//              <ButtonContainer hangUp={props.hangUp}/>
//         </View>
//     }
//   return (
//     <View>
//       <ButtonContainer hangUp={props.hangUp}/>
//     </View>
//   )
// }

// export default Video

// const styles = StyleSheet.create({
//     bContainer: {
//         marginBottom: 10,
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         borderRadius: 5,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         elevation: 5,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.8,
//         shadowRadius: 2,
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     container: {
//         flex: 1,
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         marginBottom: 40
//     },
//     video: {
//         position: 'absolute',
//         height: '100%',
//         width: '100%',
//         // borderRadius: 10,
//         // borderColor: 'black',
//         // borderWidth: 2,
//         // marginBottom: 20
//     },
//     videoLocal: {
//         position: 'absolute',
//         height: 100,
//         width: 150,
//         top: 0,
//         left: 20,
//         elevation: 10,
//         // top: '25%',
//         // borderRadius: 10,
//         // borderColor: 'black',
//         // borderWidth: 2
//     }
// })