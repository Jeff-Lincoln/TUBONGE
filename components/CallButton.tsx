import { StyleSheet, Text, TouchableOpacity, View, GestureResponderEvent } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons'; // Example video call icon

interface Props {
  onPress?: (event: GestureResponderEvent) => void;
  iconName: keyof typeof FontAwesome.glyphMap; // Ensure correct icon type from FontAwesome
  backgroundColor: string;
  style?: object;
  disabled?: boolean; // Optional disabled state
}

const CallButton: React.FC<Props> = ({ onPress, iconName, backgroundColor, style, disabled }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          { backgroundColor: backgroundColor || '#2196F3' }, // Default color
          style,
          styles.button,
          disabled && styles.disabled, // Apply disabled styles if necessary
        ]}
        disabled={disabled}
        accessible={true}
        accessibilityLabel="Video Call Button"
        accessibilityHint="Start a video call"
      >
        <FontAwesome name={iconName} color="white" size={24} />
        {/* You can replace 'video-camera' with the appropriate icon name */}
      </TouchableOpacity>
    </View>
  );
};

export default CallButton;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.6,
  },
});




// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import React from 'react'

// interface Props {
//     onPress?: any;
//     iconName: string;
//     backgroundColor: string;
//     style?: any;
// }

// const Button = (props: Props) => {
//   return (
//     <View>
//       <TouchableOpacity
//       onPress={props.onPress}
//       style={[
//         { backgroundColor: props.backgroundColor },
//         props.style,
//         styles.button,
//       ]}>
//         <Icon name={props.iconName} color="green" size={24}/>
//         //video call icon from expo icons...
//       </TouchableOpacity>
//     </View>
//   )
// }

// export default Button

// const styles = StyleSheet.create({
//     button: {
//     }
// })