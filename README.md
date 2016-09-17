- Installtion
    - https://github.com/oney/react-native-webrtc/blob/master/Documentation/iOSInstallation.md
    - edit .env.example, and rename .env. you specify your janus server. iOS don't allow you to use insecure https. So, you need to deploy trusted https server. Regarding signaling way, http is only supported at now.
    - After building xcode proj, npm start

- Design
    - I didn't use es6 syntax in janus.js library because I don't have much time to do such a job. If you like es6 synax, use https://github.com/ndarilek/node-janus. This works well.
- ToDo
    - plugin
        - ○video room (ios)
            - note
                - Switch Streaming your camera from front side to back, vice versa, is deleted in oney/react-native-webrtc-demo, because, Janus is not supporting config.pc.removeStream(localstream). My sample program is selecting your prefered camera in advance(push Switch camera).
        - ✖︎streaming
        - ✖︎audio bridge

- Encounterd bug list (probably, just for me)
add include header in RCTWebRTC/RTCVideoViewManager.m
```
#import <objc/runtime.h>
```
- Demo
![demo](https://github.com/atyenoria/react-native-webrtc-janus-gateway/blob/master/demo.jpg "demo")

- License MIT