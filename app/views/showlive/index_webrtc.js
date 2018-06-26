import React, {
    Component
} from 'react'

import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  alert,
  AppState,
  Platform,
  Dimensions,
  Alert,
  Image,findNodeHandle,

} from 'react-native'

import { Actions } from 'react-native-router-flux';
import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';

import io from 'socket.io-client';

import ChatView  from '../chat'
import Spinner from 'react-native-loading-spinner-overlay';
import { BlurView } from 'react-native-blur';
import CloseView from './close.js'
import KeepAwake from 'react-native-keep-awake';
import LoadingOverlay from 'react-native-loading-overlay';


let localStream;
const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
const pcPeers = {};
function join(roomID) {
  container.socket.emit('join', roomID, function(socketIds){
    console.log('live roomID join',roomID, socketIds);
//    for (const i in socketIds) {
      const socketId = socketIds[0];
      container.setState({ socketId:socketId});
      createPC(socketId, true);
//    }
  });
}

function getLocalStream(isFront, callback) {

  getUserMedia({
    audio: false,
    video: false
  }, function (stream) {
    console.log('getUserMedia success', stream);
    callback(stream);
  }, logError);
}


function createPC(socketId, isOffer) {
  const pc = new RTCPeerConnection(configuration);
  pcPeers[socketId] = pc;

  //createAnswer();
  createOffer();
  pc.onicecandidate = function (event) {
    console.log('onicecandidate', event.candidate);
    if (event.candidate) {
      container.socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
    }
  };


  pc.onicecandidateerror = function (event) {
    console.log('onicecandidateerror', event);
  };

  pc.onicegatheringstatechange = function (event) {
    console.log('onicegatheringstatechange', event);
  };


  pc.onaddstream = function (event) {
    console.log('ontrack',  event.stream);
    container.setState({ remoteSrc: event.stream.toURL()});
  };

  function createOffer() {
    pc.createOffer(function(desc) {
      console.log('createOffer', desc);
      pc.setLocalDescription(desc, function () {
        console.log('setLocalDescription', pc.localDescription);
        container.socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
      }, logError);
    }, logError, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });
  }

  pc.onnegotiationneeded = function () {
    console.log('onnegotiationneeded');
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
    container.setState({socketId:socketId, visible:false, remoteSrc: event.stream.toURL()});

  };

  pc.onremovestream = function (event) {
    console.log('onremovestream', event.stream);
  };


  return pc;
}

function exchange(data) {
  console.log('exchange data.sdp',data);

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
  console.log('live leave', socketId ,  container.state.socketId);
  if(socketId == container.state.socketId)
  {
    container.setState({mode:2});
  }
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
var {height, width} = Dimensions.get('window');
export  class ShowLive extends Component {
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
        roomID: this.props.broadcastdata.broadcast.broadcast_id,
        remoteSrc: null,
        visible: true,
        socketId:'',
        viewRef: null,
        mode:1,
        layout:{
         height:height,
         width:width,
        },
        currentAppState: AppState.currentState,
      };
      console.ignoredYellowBox = [
              'Setting a timer'
          ];

      this.onLiveStart = this.onLiveStart.bind(this);

    }
    imageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    onLiveStart()
    {
      console.log('onLiveStart');

    }

    componentDidMount () {

      console.log('live view',this.props);
      container.socket = io.connect('https://react-native-webrtc.herokuapp.com', {transports: ['websocket']});
      container.socket.on('exchange', function(data){
        exchange(data);
      });
      container.socket.on('leave', function(socketId){
        leave(socketId);
      });

      container.socket.on('connect', function(data) {
        console.log('connect',data);
        localStream= null;
          container.setState({status: 'connect', info: 'Connecting'});
          join(container.state.roomID);
          container.setState({
           visible: false,
           mode:0
        });
      });


    }

    componentWillUnmount() {
      if(container.socket)
          container.socket.disconnect();
    }


    shouldComponentUpdate(nextProps, nextState){
        console.log("shouldComponentUpdate: " + JSON.stringify(nextProps) + " " + JSON.stringify(nextState));
        return true;
    }

    _isBlur()
    {
      if(this.state.viewRef != null)
      {
        return (
                 <BlurView
                   style={styles.Blur}
                   viewRef={this.state.viewRef}
                   blurType="light"
                   blurAmount={10}
                 />
        )
      }
    }

    _getViewStatus()
    {
      if(this.state.mode==1)
      {
        return (
          <View style={styles.Blur}>
          <Image
            ref={(img) => { this.backgroundImage = img; }}
            source={require('../../assets/imgs/ImageA.png')}
            style={{  width: container.state.layout.width,
              height:  container.state.layout.height,}}
            onLoadEnd={this.imageLoaded.bind(this)}
          />{this._isBlur()}
          <LoadingOverlay visible={this.state.visible}/>
         </View>)

      }else if(this.state.mode==2){
          return (
            <View style={styles.floatView}>
              <CloseView thumbnail={this.props.broadcastdata.broadcast.thumbnail.toString()}/>
            </View>
          )

      }

    }


    render() {
      return (

        <View style={styles.parent}>
            <KeepAwake />
            <View style={styles.fullScreen}>
               <RTCView streamURL={this.state.remoteSrc} style={{
                 position: 'absolute',
               width: container.state.layout.width*2,
               height:  container.state.layout.height,
               alignSelf: 'center',
               shadowOpacity: 0,
               }}/>
               <ChatView onLiveStart={this.onLiveStart}  host_picture={this.props.broadcastdata.user.picture} host_id={this.props.broadcastdata.user.user_id} isBroad={false} broadcastid={this.props.broadcastdata.broadcast.broadcast_id}/>
            </View>

             {this._getViewStatus()}
         </View>


      )
    }


}


const styles = StyleSheet.create({
  image: {
    flex:1,
    top: 20, left: 0, bottom: 0, right: 0,
  },Blur: {
      position: "absolute",
      top: 0, left: 0, bottom: 0, right: 0,
    },
  remotefView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    top:0,
    right:0,
    shadowOpacity: 0,
    backgroundColor: '#F5FCFF',
  },
  container: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
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
   },
   parent: {
       flex: 1,
   }
});
