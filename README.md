- installtion
    - edit .env.example, and rename .env
    - npm start

- ToDo
    - plugin
        - ○video room
        - ✖︎streaming
        - ✖︎audio bridge

- disable App Transport Security (ATS)

http://stackoverflow.com/questions/32755674/ios9-getting-error-an-ssl-error-has-occurred-and-a-secure-connection-to-the-ser

- add include header in RCTWebRTC/RTCVideoViewManager.m
```
#import <objc/runtime.h>
```


- babel type def error
Example:

npm install babel-preset-react-native-stage-0 --save
.babelrc

{
  "presets": ["react-native-stage-0"]
}
or with decorator support

{
  "presets": ["react-native-stage-0/decorator-support"]
}
Empty cache and Restart

watchman watch-del-all

./node_modules/react-native/packager/packager.sh start --reset-cache