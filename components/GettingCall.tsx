import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import CallButton from './CallButton';

interface Props {
  hangUp: () => void;
  join: () => void;
}

const GettingCall = (props: Props) => {
  return (
    <View style={styles.container}>
      {/* Image of the caller */}
      <Image source={require('../assets/images/tatum.jpg')} style={styles.image} />

      <Text style={styles.callText}>Incoming Call</Text>

      {/* Accept and Decline Call Buttons */}
      <View style={styles.buttonContainer}>
        <CallButton
          iconName="phone"
          backgroundColor="green"
          onPress={props.join}
          style={styles.callButton}
        />
        <CallButton
          iconName="phone"
          backgroundColor="red"
          onPress={props.hangUp}
          style={styles.callButton}
        />
      </View>
    </View>
  );
};

export default GettingCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  callText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  callButton: {
    paddingHorizontal: 30,
  },
});




// import { Button, Image, StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import CallButton from './CallButton';

// interface Props {
//     hangUp: () => void;
//     join: () => void;
// }

// const GettingCall = (props: Props) => {
//   return (
//     <View>
//       <Image source={require('../assets/images/tatum.jpg')} />
//         <CallButton
//         iconName='phone'
//         backgroundColor='green'
//         onPress={props.join}
//         style={{ marginRight: 30}}
//         />
//         <CallButton
//         iconName='phone'
//         backgroundColor='red'
//         onPress={props.join}
//         style={{ marginRight: 30}}
//         />

//     </View>
//   )
// }

// export default GettingCall

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//     }
// })