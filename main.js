'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextInput,
  ListView,
} from 'react-native';

import io from 'socket.io-client/socket.io';

const socket = io.connect('https://react-native-webrtc.herokuapp.com', {transports: ['websocket']});

import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';







// ApiClient.init(API_KEY, ANOTHER_CONFIG)

// import Config from 'react-native-config'

// console.log(Config.JANUS)  // 'https://myapi.com'
// Config.GOOGLE_MAPS_API_KEY  // 'abcdefgh'

// console.log("Janus library")
// console.log(JANUS)
// console.log(Janus)
// console.log(ANOTHER_CONFIG)

import { JANUS } from 'react-native-dotenv'
var server = JANUS

var janus = null;
var sfutest = null;
var started = false;

var myusername = null;
var myid = null;
var mystream = null;

var feeds = [];
var bitrateTimer = [];

var localstream_janus


// $(document).ready(function() {
    // Initialize the library (all console debuggers enabled)
function janusStart(){
var Janus = require('./janus.nojquery.js');
    Janus.init({debug: "all", callback: function() {
            if(started)
                return;
            started = true;
    }});
    janus = new Janus(
                {
                    server: server,
                    camera_front: container.state.isFront,
                    success: function() {
                        janus.attach(
                            {
                                plugin: "janus.plugin.videoroom",
                                success: function(pluginHandle) {
                                    sfutest = pluginHandle;
                                    Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
                                    Janus.log("  -- This is a publisher/manager");
                                            var register = { "request": "join", "room": 1234, "ptype": "publisher", "display": "username" };
                                            sfutest.send({"message": register});
                                            console.log("send msg join room")
                                },
                                error: function(error) {
                                    Janus.error("  -- Error attaching plugin...", error);
                                    bootbox.alert("Error attaching plugin... " + error);
                                },
                                consentDialog: function(on) {
                                },
                                mediaState: function(medium, on) {
                                    Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                                },
                                webrtcState: function(on) {
                                    Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                                    // $("#videolocal").parent().parent().unblock();
                                },
                                onmessage: function(msg, jsep) {
                                    Janus.debug(" ::: Got a message (publisher) :::");
                                    Janus.debug(JSON.stringify(msg));
                                    var event = msg["videoroom"];
                                    Janus.debug("Event: " + event);
                                    if(event != undefined && event != null) {
                                        if(event === "joined") {
                                            // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                                            myid = msg["id"];
                                            Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
                                            publishOwnFeed(true);
                                            // Any new feed to attach to?
                                            if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
                                                var list = msg["publishers"];
                                                Janus.debug("Got a list of available publishers/feeds:");
                                                Janus.debug(list);
                                                for(var f in list) {
                                                    var id = list[f]["id"];
                                                    var display = list[f]["display"];
                                                    Janus.debug("  >> [" + id + "] " + display);
                                                    newRemoteFeed(id, display)
                                                }
                                            }
                                        } else if(event === "destroyed") {
                                            // The room has been destroyed
                                            Janus.warn("The room has been destroyed!");
                                            bootbox.alert(error, function() {
                                                window.location.reload();
                                            });
                                        } else if(event === "event") {
                                            // Any new feed to attach to?
                                            if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
                                                var list = msg["publishers"];
                                                Janus.debug("Got a list of available publishers/feeds:");
                                                Janus.debug(list);

                                                for(var f in list) {
                                                    var id = list[f]["id"];
                                                    var display = list[f]["display"];
                                                    Janus.debug("  >> [" + id + "] " + display);
                                                    newRemoteFeed(id, display)
                                                }
                                            } else if(msg["leaving"] !== undefined && msg["leaving"] !== null) {
                                                // One of the publishers has gone away?
                                                var leaving = msg["leaving"];
                                                Janus.log("Publisher left: " + leaving);
                                                var remoteFeed = null;
                                                for(var i=1; i<6; i++) {
                                                    if(feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == leaving) {
                                                        remoteFeed = feeds[i];
                                                        break;
                                                    }
                                                }
                                                if(remoteFeed != null) {
                                                    Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                                    $('#remote'+remoteFeed.rfindex).empty().hide();
                                                    $('#videoremote'+remoteFeed.rfindex).empty();
                                                    feeds[remoteFeed.rfindex] = null;
                                                    remoteFeed.detach();
                                                }
                                                container.setState({info: 'One peer left!'});
                                                const remoteList = container.state.remoteList;
                                                console.log(remoteList)
                                                delete remoteList[leaving]
                                                container.setState({ remoteList: remoteList });
                                            } else if(msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
                                                // One of the publishers has unpublished?
                                                var unpublished = msg["unpublished"];
                                                Janus.log("Publisher left: " + unpublished);
                                                if(unpublished === 'ok') {
                                                    // That's us
                                                    sfutest.hangup();
                                                    return;
                                                }
                                                var remoteFeed = null;
                                                for(var i=1; i<6; i++) {
                                                    if(feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == unpublished) {
                                                        remoteFeed = feeds[i];
                                                        break;
                                                    }
                                                }
                                                if(remoteFeed != null) {
                                                    Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                                    $('#remote'+remoteFeed.rfindex).empty().hide();
                                                    $('#videoremote'+remoteFeed.rfindex).empty();
                                                    feeds[remoteFeed.rfindex] = null;
                                                    remoteFeed.detach();
                                                }
                                            } else if(msg["error"] !== undefined && msg["error"] !== null) {
                                                bootbox.alert(msg["error"]);
                                            }
                                        }
                                    }
                                    if(jsep !== undefined && jsep !== null) {
                                        Janus.debug("Handling SDP as well...");
                                        Janus.debug(jsep);
                                        sfutest.handleRemoteJsep({jsep: jsep});
                                    }
                                },
                                onlocalstream: function(stream) {
                                    localstream_janus = stream;
                                    container.setState({selfViewSrc: stream.toURL()});

                                },
                                onremotestream: function(stream) {
                                    // The publisher stream is sendonly, we don't expect anything here
                                },
                                oncleanup: function() {
                                    Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
                                    mystream = null;
                                    $('#videolocal').html('<button id="publish" class="btn btn-primary">Publish</button>');
                                    $('#publish').click(function() { publishOwnFeed(true); });
                                    $("#videolocal").parent().parent().unblock();
                                }
                            });
                    },
                    error: function(error) {
                        // Janus.error(error);
                        // bootbox.alert(error, function() {
                        //     window.location.reload();
                        // });
                    },
                    destroyed: function() {
                        window.location.reload();
                    }
                });

// janus = new Janus()
function checkEnter(field, event) {
    var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
    if(theCode == 13) {
        registerUsername();
        return false;
    } else {
        return true;
    }
}



function publishOwnFeed(useAudio) {

    sfutest.createOffer(
        {
            media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true}, // Publishers are sendonly
            success: function(jsep) {
                Janus.debug("Got publisher SDP!");
                Janus.debug(jsep);
                var publish = { "request": "configure", "audio": useAudio, "video": true };
                sfutest.send({"message": publish, "jsep": jsep});
            },
            error: function(error) {
                Janus.error("WebRTC error:", error);
                if (useAudio) {
                     publishOwnFeed(false);
                } else {
                    bootbox.alert("WebRTC error... " + JSON.stringify(error));
                    $('#publish').removeAttr('disabled').click(function() { publishOwnFeed(true); });
                }
            }
        });
}

function toggleMute() {
    var muted = sfutest.isAudioMuted();
    Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
    if(muted)
        sfutest.unmuteAudio();
    else
        sfutest.muteAudio();
    muted = sfutest.isAudioMuted();
    $('#mute').html(muted ? "Unmute" : "Mute");
}

function unpublishOwnFeed() {
    // Unpublish our stream
    $('#unpublish').attr('disabled', true).unbind('click');
    var unpublish = { "request": "unpublish" };
    sfutest.send({"message": unpublish});
}

function newRemoteFeed(id, display) {
    // A new feed has been published, create a new plugin handle and attach to it as a listener
    var remoteFeed = null;
    janus.attach(
        {
            plugin: "janus.plugin.videoroom",
            success: function(pluginHandle) {
                remoteFeed = pluginHandle;
                Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
                Janus.log("  -- This is a subscriber");
                // We wait for the plugin to send us an offer1
                var listen = { "request": "join", "room": 1234, "ptype": "listener", "feed": id };
                remoteFeed.send({"message": listen});
            },
            error: function(error) {
                Janus.error("  -- Error attaching plugin...", error);
                bootbox.alert("Error attaching plugin... " + error);
            },
            onmessage: function(msg, jsep) {
                Janus.debug(" ::: Got a message (listener) :::");
                Janus.debug(JSON.stringify(msg));
                var event = msg["videoroom"];
                Janus.debug("Event: " + event);
                if(event != undefined && event != null) {
                    if(event === "attached") {
                        // Subscriber created and attached
                    }
                }
                if(jsep !== undefined && jsep !== null) {
                    Janus.debug("Handling SDP as well...");
                    Janus.debug(jsep);
                    // Answer and attach
                    remoteFeed.createAnswer(
                        {
                            jsep: jsep,
                            media: { audioSend: false, videoSend: false },  // We want recvonly audio/video
                            success: function(jsep) {
                                Janus.debug("Got SDP!");
                                Janus.debug(jsep);
                                var body = { "request": "start", "room": 1234 };
                                remoteFeed.send({"message": body, "jsep": jsep});
                            },
                            error: function(error) {
                                Janus.error("WebRTC error:", error);
                                bootbox.alert("WebRTC error... " + JSON.stringify(error));
                            }
                        });
                }
            },
            webrtcState: function(on) {
                Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
            },
            onlocalstream: function(stream) {
                // The subscriber stream is recvonly, we don't expect anything here
            },
            onremotestream: function(stream) {
                    console.log('onaddstream', stream);
                    container.setState({info: 'One peer join!'});
                    console.log(remoteFeed)
                    const remoteList = container.state.remoteList;

                    remoteList[id] = stream.toURL();
                    remoteNameList[id] = display
                    container.setState({ remoteList: remoteList });
            },
            oncleanup: function() {
                Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
                if(remoteFeed.spinner !== undefined && remoteFeed.spinner !== null)
                    remoteFeed.spinner.stop();
                remoteFeed.spinner = null;
                $('#waitingvideo'+remoteFeed.rfindex).remove();
                $('#curbitrate'+remoteFeed.rfindex).remove();
                $('#curres'+remoteFeed.rfindex).remove();
                if(bitrateTimer[remoteFeed.rfindex] !== null && bitrateTimer[remoteFeed.rfindex] !== null)
                    clearInterval(bitrateTimer[remoteFeed.rfindex]);
                bitrateTimer[remoteFeed.rfindex] = null;
            }
        });
}


}


function mapHash(hash, func) {
  const array = [];
  for (const key in hash) {
    const obj = hash[key];
    array.push(func(obj, key));
  }
  return array;
}

let container;
let remoteNameList=[];


const RCTWebRTCDemo = React.createClass({
  getInitialState: function() {
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => true});
    return {
      info: 'Initializing',
      status: 'init',
      roomID: '',
      isFront: true,
      selfViewSrc: null,
      remoteList: {},
      textRoomConnected: false,
      textRoomData: [],
      textRoomValue: '',
    };
  },
  componentDidMount: function() {
    container = this;
    container.setState({status: 'ready', info: 'Janus Gateway Video Room '});
  },
  _press(event) {
    janusStart()
    this.setState({status: 'connect', info: 'Connecting'});

  },
  _switchVideoType() {
    const isFront = !this.state.isFront;
    this.setState({isFront});
  },
  receiveTextData(data) {
    const textRoomData = this.state.textRoomData.slice();
    textRoomData.push(data);
    this.setState({textRoomData, textRoomValue: ''});
  },
  _textRoomPress() {
    if (!this.state.textRoomValue) {
      return
    }
    const textRoomData = this.state.textRoomData.slice();
    textRoomData.push({user: 'Me', message: this.state.textRoomValue});
    for (const key in pcPeers) {
      const pc = pcPeers[key];
      pc.textDataChannel.send(this.state.textRoomValue);
    }
    this.setState({textRoomData, textRoomValue: ''});
  },
  _renderTextRoom() {
    return (
      <View style={styles.listViewContainer}>
        <ListView
          dataSource={this.ds.cloneWithRows(this.state.textRoomData)}
          renderRow={rowData => <Text>{`${rowData.user}: ${rowData.message}`}</Text>}
          />
        <TextInput
          style={{width: 200, height: 30, borderColor: 'gray', borderWidth: 1}}
          onChangeText={value => this.setState({textRoomValue: value})}
          value={this.state.textRoomValue}
        />
        <TouchableHighlight
          onPress={this._textRoomPress}>
          <Text>Send</Text>
        </TouchableHighlight>
      </View>
    );
  },
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.info}
        </Text>
        {this.state.textRoomConnected && this._renderTextRoom()}
        { this.state.status == 'ready' ?
        <View style={{flexDirection: 'row'}}>
          <Text>
            {this.state.isFront ? "Use front camera" : "Use back camera"}
          </Text>
          <TouchableHighlight
            style={{borderWidth: 1, borderColor: 'black'}}
            onPress={this._switchVideoType}>
            <Text>Switch camera</Text>
          </TouchableHighlight>
        </View> : null
        }
        { this.state.status == 'ready' ?
          (<View >
            <TouchableHighlight
              onPress={this._press}>
              <Text style={{fontSize: 50}}>Enter room</Text>
            </TouchableHighlight>
          </View>) : null
        }

        { this.state.status != 'ready' ?
        (<View >
            <Text>You</Text>
            <RTCView streamURL={this.state.selfViewSrc} style={styles.selfView}/>
        </View>) : null
        }
        {
          mapHash(this.state.remoteList, function(remote, index) {
            return  (
                <View  key={index} style={styles.remoteView}>
                <Text>{remoteNameList[index]}</Text>
                <RTCView key={index} streamURL={remote} style={styles.remoteView}/>
                </View>
                )
          })
        }
      </View>
    );
  }
});

const styles = StyleSheet.create({
  selfView: {
    width: 200,
    height: 150,
  },
  remoteView: {
    width: 200,
    height: 150,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  listViewContainer: {
    height: 150,
  },
});

AppRegistry.registerComponent('RCTWebRTCDemo', () => RCTWebRTCDemo);
