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
  Platform,
  Dimensions,
  AppState
} from 'react-native';


import Spinner from 'react-native-loading-spinner-overlay';
import io from 'socket.io-client';
import DefaultPreference from 'react-native-default-preference';
import GlobalDataManager from '../.././data/globaldatamanager.js';
import KeepAwake from 'react-native-keep-awake';

import ChatView  from '../chat'

import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';

import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';


const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

const pcPeers = {};
let localStream;
var {height, width} = Dimensions.get('window');


function getLocalStream(isFront, callback) {

  let videoSourceId;

  // on android, you don't have to specify sourceId manually, just use facingMode
  // uncomment it if you want to specify
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      console.log("sourceInfos: ", sourceInfos);

      for (const i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
          videoSourceId = sourceInfo.id;
        }
      }
    });
  }
  getUserMedia({
    audio: true,
    video: {
      mandatory: {
        minWidth: 320, // Provide your own width, height and frame rate here
        minHeight: 240,
        minFrameRate: 30,
      },
      facingMode: (isFront ? "user" : "environment"),
      optional: (videoSourceId ? [{sourceId: videoSourceId}] : []),
    }
  }, function (stream) {
    console.log('getUserMedia success', stream);
    callback(stream);
  }, logError);
}

function join(roomID) {
  container.socket.emit('join', roomID, function(socketIds){
    console.log('join', socketIds);
    for (const i in socketIds) {
      const socketId = socketIds[i];
      createPC(socketId, true);
    }
  });
}

function createPC(socketId, isOffer) {
  const pc = new RTCPeerConnection(configuration);
  pcPeers[socketId] = pc;

  pc.onicecandidate = function (event) {
    console.log('onicecandidate', event.candidate);
    if (event.candidate) {
      container.socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
    }
  };

  function createOffer() {
    pc.createOffer(function(desc) {
      console.log('createOffer', desc);
      pc.setLocalDescription(desc, function () {
        console.log('setLocalDescription', pc.localDescription);
        container.socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
      }, logError);
    }, logError);
  }

  pc.onnegotiationneeded = function () {
    console.log('onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  }

  pc.oniceconnectionstatechange = function(event) {
    console.log('oniceconnectionstatechange', event.target.iceConnectionState);
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats();
      }, 1000);
    }
  };


  pc.onsignalingstatechange = function(event) {
    console.log('onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream = function (event) {
    console.log('onaddstream', event.stream);
    container.setState({info: 'One peer join!'});

    const remoteList = container.state.remoteList;
    remoteList[socketId] = event.stream.toURL();

    console.log('event.stream.toURL()',event.stream.toURL());

    container.setState({ remoteList: remoteList });
  };
  pc.onremovestream = function (event) {
    console.log('onremovestream', event.stream);
  };

  pc.addStream(localStream);

  return pc;
}

function exchange(data) {
  const fromId = data.from;
  let pc;
  if (fromId in pcPeers) {
    pc = pcPeers[fromId];
  } else {
    pc = createPC(fromId, false);
  }

  if (data.sdp) {
    console.log('exchange sdp', data);
    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer(function(desc) {
          console.log('createAnswer', desc);
          pc.setLocalDescription(desc, function () {
            console.log('setLocalDescription', pc.localDescription);
            container.socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    console.log('exchange candidate', data);
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function leave(socketId) {
  console.log('leave', socketId);
  const pc = pcPeers[socketId];
//  const viewIndex = pc.viewIndex;
  if(pc)
  {
     pc.close();
     delete pcPeers[socketId];
   }
   container.setState({info: 'One peer leave!'});

}

function logError(error) {
  console.log("logError", error);
}

function getStats() {
  const pc = pcPeers[Object.keys(pcPeers)[0]];
  if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
    const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
    console.log('track', track);
    pc.getStats(track, function(report) {
      console.log('getStats report', report);
    }, logError);
  }
}

let container;

export  class BroadcastingView extends Component {
  static propTypes = {
   broadcastdata: React.PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props)
    console.log('ShowLive', props);
    container = this;
    this.socket = null;
    this.state = {
      info: 'Initializing',
      status: 'init',
      roomID:  this.props.broadcastdata.broadcast.broadcast_id,
      isFront: true,
      selfViewSrc: null,
      visible: true,
      remoteList:[],
      layout:{
       height:height,
       width:width,
       },
      currentAppState: AppState.currentState,
    };

    console.ignoredYellowBox = [
        'Setting a timer'
    ];

   console.log('this.props.broadcastdata ',this.props.broadcastdata );

  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
      var request = {
            method: 'POST',
            headers: {
               'Accept': 'application/json',
               'Content-Type': 'multipart/form-data',
               'X-WDTV-TOKEN':GlobalDataManager.token
             },
        };

      fetch('https://tv.sponb.io/api/v1/broadcast/stop', request)
        .then(response => {
            console.log('response' , response);
           return response.json();})
        .then(responseData => {
         console.log('broadcast stop' , responseData);
         return responseData;

        })
        .then(data => {
            console.log('data' , data);
            this.socket.close();
            if (localStream) {
              for (const id in pcPeers) {
                const pc = pcPeers[id];
                pc && pc.removeStream(localStream);
              }
              localStream.getTracks().forEach(track => track.stop());
              localStream.release();
              localStream = null;
            }
        })
        .catch(err => {
            console.log("broadcast start fetch error" + err);
      });

  }

  _handleAppStateChange(currentAppState) {
//    this.setState({ currentAppState, });

    console.log('currentAppState',currentAppState);
  }

  componentDidMount() {

    AppState.addEventListener('change', this._handleAppStateChange);
    this.socket = io.connect('https://react-native-webrtc.herokuapp.com', {transports: ['websocket']});

    this.socket.on('exchange', function(data){
      exchange(data);
    });
    this.socket.on('leave', function(socketId){
      leave(socketId);
    });

    this.socket.on('connect', function(data) {
      console.log('connect');
      getLocalStream(true, function(stream) {
        localStream = stream;
        container.setState({selfViewSrc: stream.toURL()});
        container.setState({status: 'ready', info: 'Please enter or create room ID'});
      });
    });
    this._press();

    let loading = setInterval(() => {
       this.setState({
         visible: false
       });

       clearInterval(loading);

     }, 3000);
  }

  _press(event) {
    //this.refs.roomID.blur();
    this.setState({status: 'connect', info: 'Connecting'});
    join(this.state.roomID);
  }

  _switchVideoType() {
    const isFront = !this.state.isFront;
    this.setState({isFront});
    getLocalStream(isFront, function(stream) {
      if (localStream) {
        for (const id in pcPeers) {
          const pc = pcPeers[id];
          pc && pc.removeStream(localStream);
        }
        localStream.release();
      }
      localStream = stream;
      container.setState({selfViewSrc: stream.toURL()});

      console.log('_switchVideoType' , pcPeers)
      for (const id in pcPeers) {
        const pc = pcPeers[id];
        pc && pc.addStream(localStream);
      }
    });
  }

  onBroadcastStart() {
  console.log('onBroadcastStart');
  }

  onBroadcastStop() {
    console.log('onBroadcastStop');
  }

  onChangeMode() {
    console.log('onChangeMode');
    container._switchVideoType();
  }


  render() {
    return (
          <View style={styles.parent}>
              <KeepAwake />
               <View style={styles.fullScreen}>
                 <RTCView streamURL={this.state.selfViewSrc} style={{
                                  position: 'absolute',
                                width: container.state.layout.width*2,
                                height:  container.state.layout.height,
                                alignSelf: 'center',
                                shadowOpacity: 0,
                                }}
                              />
                 <Spinner visible={this.state.visible} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
               </View>
                <View style={styles.floatView}>
                  <ChatView onChangeMode={this.onChangeMode} onBroadcastStart={this.onBroadcastStart}    host_id={GlobalDataManager.user_id}
                    host_picture={GlobalDataManager.picture} isBroad={true} broadcastid={this.props.broadcastdata.broadcast.broadcast_id}/>
                </View>
           </View>
         );
  }
};

const styles = StyleSheet.create({
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
  fullScreen: {
       flex:1,
       backgroundColor: 'gray',
   },
   floatView: {
     position: 'absolute',
     bottom: 0,
     left: 0,
     top:0,
     right:0,
     zIndex: 2,
   },
   parent: {
       flex: 1,
   }
});
