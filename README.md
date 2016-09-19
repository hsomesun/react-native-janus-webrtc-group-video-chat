- Installtion
    - https://github.com/oney/react-native-webrtc/blob/master/Documentation/iOSInstallation.md
    - Edit .env.example, and rename .env. You specify your janus server. iOS don't allow you to use insecure https. So, You need to deploy trusted https server. Regarding signaling way, http is only supported at now.
    - After building xcode proj, npm start

- Design
    - I use pure janus.js library because of tiredness. If you like es6 synax, and more clean library, use https://github.com/ndarilek/node-janus. This works well.

- plugin
    - ○video room (ios,android)
        - note
            - Switch Streaming your camera from front side to back, vice versa, on demand is deleted from oney/react-native-webrtc-demo, because Janus do not support config.pc.removeStream(localstream). My sample program is selecting your preferred camera in advance(push Switch camera).
            - device test list
                - janus
                    - commit 79c65e8f12a6354687ee6793373e0b008e52d462
                - chrome
                    - M52 stable
                - ios: ○vp8 ○vp9 ✖︎h264
                - android: ○vp8 ✖vp9 ✖︎h264

- Encountered bug lists (probably, just for me)

add include header in RCTWebRTC/RTCVideoViewManager.m
```
#import <objc/runtime.h>
```
- Demo
![demo](https://github.com/atyenoria/react-native-webrtc-janus-gateway/blob/master/demo.jpg "demo")

- License MIT
