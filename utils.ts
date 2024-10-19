import { mediaDevices } from "react-native-webrtc";

export default class Utils {
    static async getStream() {
        try {
            let isFront = true;
            const sourceInfos: any = await mediaDevices.enumerateDevices();
            console.log(sourceInfos);

            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (sourceInfo.kind === "videoinput" && sourceInfo.facing === (isFront ? "front" : "environment")) {
                    videoSourceId = sourceInfo.deviceId;
                    break; // Found the camera we need, stop iterating
                }
            }

            // Requesting the media stream from the camera and microphone
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: {
                    height: 640,
                    width: 480,
                    frameRate: 30,
                    facingMode: isFront ? "user" : "environment", // Adjust front or rear camera
                    deviceId: videoSourceId, // Use the selected video source
                },
            });

            // Return the media stream
            return stream;

        } catch (error) {
            console.error("Error fetching media stream:", error);
            return null;  // Return null if there's an error fetching the stream
        }
    }
}



// import { mediaDevices } from "react-native-webrtc";

// export default class Utils {
//     static async getStream() {

//         let isFront = true;
//         const sourceInfos = await mediaDevices.enumerateDevices().then(sourceInfos => {
//             console.log(sourceInfos);
            
//             let videoSourceId;
//             for (let i=0; i< sourceInfos.length; i++) {
//                 const sourceInfo = sourceInfos[i];
//                 if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
//                     videoSourceId = sourceInfo.deviceId;
//                 }
//             }

//             const stream = await mediaDevices.getUserMedia({
//                 audio: true,
//                 video: {
//                     height: 640,
//                     width: 480,
//                     framerate: 30,
//                     facingMode: (isFront ? "user" : "environment"),
//                     deviceId: videoSourceId,
//                 }
//             });

//             if (typeof stream != 'boolean') return stream;
//             return null;
            
//             // .then(stream => {
//             //     //Got stream!
//             // })
//             // .catch(error => {
//             //     //log error
//             //     console.log("Error: catch stream", error)
//             // });
//             // )
//         });
//     }
// }