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
    AppState,
} from 'react-native';


import Spinner from 'react-native-loading-spinner-overlay';
import io from 'socket.io-client';
import DefaultPreference from 'react-native-default-preference';
import GlobalDataManager from '../.././data/globaldatamanager.js';
import KeepAwake from 'react-native-keep-awake';
import _ from 'lodash';

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

var peerConnectionConfig = {'iceServers': []};
var peerConnection = null;
var wsConnection = null;
var wsURL = 'wss://59c0fb6478c11.streamlock.net/webrtc-session.json';
var localStream;
var {height, width} = Dimensions.get('window');
var container;
var newAPI = false;
var videoBitrate = 360;
var audioBitrate = 64;
var videoFrameRate = "30";
var userData = {
    param1:"value1"
};

function getLocalStream(isFront, callback){

    let videoSourceId;
    // on android, you don't have to specify sourceId manually, just use facingMode
    // uncomment it if you want to specify
    if (Platform.OS === 'ios'){
        MediaStreamTrack.getSources(sourceInfos => {
            console.log("sourceInfos: ", sourceInfos);
            for (const i = 0; i < sourceInfos.length; i++){
                const sourceInfo = sourceInfos[i];
                if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")){
                    videoSourceId = sourceInfo.id;
                }
            }
        });
    }
    getUserMedia({
        audio: true,
        video: {
            mandatory: {
                minWidth: 500, // Provide your own width, height and frame rate here
                minHeight: 300,
                minFrameRate: 30,
            },
            facingMode: (isFront ? "user" : "environment"),
            optional: (videoSourceId ? [{sourceId: videoSourceId}] : []),
        }
    }, function (stream){
        console.log('getUserMedia success', stream);
        callback(stream);
    }, console.log);
}

function gotIceCandidate(event){
    if(event.candidate != null){
        console.log('gotIceCandidate: '+JSON.stringify({'ice': event.candidate}));
    }
}


function gotDescription(description){
    var enhanceData = new Object();

    if (audioBitrate !== undefined)
        enhanceData.audioBitrate = Number(audioBitrate);
    if (videoBitrate !== undefined)
        enhanceData.videoBitrate = Number(videoBitrate);
    if (videoFrameRate !== undefined)
        enhanceData.videoFrameRate = Number(videoFrameRate);

    description.sdp = enhanceSDP(description.sdp, enhanceData);
    description = flipVideoCodec(description);
    description = rotateVideoCodec(description);
    //console.log('gotDescription: '+JSON.stringify({'sdp': description}));

    var streamInfo = {
        applicationName:"webrtc",
        streamName:container.props.broadcastdata.broadcast.broadcast_id,
        sessionId:"[empty]"
    };

    //console.log('streamName: '+container.props.broadcastdata.broadcast.broadcast_id);
    if(peerConnection){
        let peerConnectionInfo = JSON.stringify({
            direction:'publish',
            command:'sendOffer',
            sdp:description,
            streamInfo,
            userData,
        });
        peerConnection.setLocalDescription(description, () => {
            //console.log('sending peerConnectionInfo->', peerConnectionInfo)
            wsConnection.send(peerConnectionInfo)
        }, console.error);
    }else{
        console.error('peerConnection is undefined');
    }
}


const audioBandwidth = 50;
const videoBandwidth = 256;
function setBandwidth(sdp) {

    try{
        sdp.sdp = sdp.sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audioBandwidth + '\r\n');
        sdp.sdp = sdp.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videoBandwidth + '\r\n');
    }catch(e){
        console.log('Replacing sdp', e)
    }

    return sdp;
}

function flipVideoCodec(description) {
    description.sdp = description.sdp.replace(/VP8/g, "H264");
    return description;
}

function rotateVideoCodec(description){
    description.sdp = _.replace(description.sdp,"video-orientation","video-orientation:0")
    return description;
}

function enhanceSDP(sdpStr, enhanceData){
    var sdpLines = sdpStr.split(/\r\n/);
    var sdpSection = 'header';
    var hitMID = false;
    var sdpStrRet = '';

    for(var sdpIndex in sdpLines){
        var sdpLine = sdpLines[sdpIndex];

        if (sdpLine.length <= 0)
            continue;

        sdpStrRet += sdpLine;

        if (sdpLine.indexOf("m=audio") === 0){
            sdpSection = 'audio';
            hitMID = false;
        }
        else if (sdpLine.indexOf("m=video") === 0){
            sdpSection = 'video';
            hitMID = false;
        }
        else if (sdpLine.indexOf("a=rtpmap") == 0 ){
            sdpSection = 'bandwidth';
            hitMID = false;
        }

        if (sdpLine.indexOf("a=mid:") === 0 || sdpLine.indexOf("a=rtpmap") == 0 ){
            if (!hitMID){
                if ('audio'.localeCompare(sdpSection) == 0){
                    if (enhanceData.audioBitrate !== undefined){
                        sdpStrRet += '\r\nb=CT:' + (enhanceData.audioBitrate);
                        sdpStrRet += '\r\nb=AS:' + (enhanceData.audioBitrate);
                    }
                    hitMID = true;
                }
                else if ('video'.localeCompare(sdpSection) == 0){
                    if (enhanceData.videoBitrate !== undefined){
                        sdpStrRet += '\r\nb=CT:' + (enhanceData.videoBitrate);
                        sdpStrRet += '\r\nb=AS:' + (enhanceData.videoBitrate);
                        if ( enhanceData.videoFrameRate !== undefined ){
                            sdpStrRet += '\r\na=framerate:'+enhanceData.videoFrameRate;
                        }
                    }
                    hitMID = true;
                }
                else if ('bandwidth'.localeCompare(sdpSection) == 0 ){
                    var rtpmapID;
                    rtpmapID = getrtpMapID(sdpLine);
                    if ( rtpmapID !== null  ){
                        var match = rtpmapID[2].toLowerCase();
                        if ( ('vp9'.localeCompare(match) == 0 ) ||  ('vp8'.localeCompare(match) == 0 ) || ('h264'.localeCompare(match) == 0 ) ||
                            ('red'.localeCompare(match) == 0 ) || ('ulpfec'.localeCompare(match) == 0 ) || ('rtx'.localeCompare(match) == 0 ) ){
                            if (enhanceData.videoBitrate !== undefined){
                                sdpStrRet+='\r\na=fmtp:'+rtpmapID[1]+' x-google-min-bitrate='+(enhanceData.videoBitrate)+';x-google-max-bitrate='+(enhanceData.videoBitrate);
                            }
                        }

                        if ( ('opus'.localeCompare(match) == 0 ) ||  ('isac'.localeCompare(match) == 0 ) || ('g722'.localeCompare(match) == 0 ) || ('pcmu'.localeCompare(match) == 0 ) ||
                            ('pcma'.localeCompare(match) == 0 ) || ('cn'.localeCompare(match) == 0 )){
                            if (enhanceData.audioBitrate !== undefined){
                                sdpStrRet+='\r\na=fmtp:'+rtpmapID[1]+' x-google-min-bitrate='+(enhanceData.audioBitrate)+';x-google-max-bitrate='+(enhanceData.audioBitrate);
                            }
                        }
                    }
                }
            }
        }
        sdpStrRet += '\r\n';
    }
    return sdpStrRet;
}

function switchVideoType(){
    const isFront = !container.state.isFront;
    container.setState({isFront});
    container.setState({selfViewSrc:null})

    stopPublisher();
    startPublisher();
}

function getrtpMapID(line){
    var findid = new RegExp('a=rtpmap:(\\d+) (\\w+)/(\\d+)');
    var found = line.match(findid);
    return (found && found.length >= 3) ? found: null;
}


function errorHandler(error){
    console.log(error);
}

function wsConnect(url){

    console.log('wsConnect', url);
    wsConnection = new WebSocket(url);
    wsConnection.binaryType = 'arraybuffer';

    wsConnection.onopen = function(){
        console.log("wsConnection.onopen");
        peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.onicecandidate = gotIceCandidate;

        getLocalStream(container.state.isFront, function(localStream){
            peerConnection.addStream(localStream);
            container.setState({selfViewSrc: localStream.toURL()});
            peerConnection.createOffer(gotDescription, console.log);
            //console.log("selfViewSrc", localStream.toURL());
            container.setState({
                visible: false
            });
        });

    }

    wsConnection.onmessage = function(evt){
        console.log('wsConnection.onmessage', evt)
        var msgJSON = JSON.parse(evt.data);
        console.log('wsConnection.onmessage->msgJSON', msgJSON);
        var msgStatus = Number(msgJSON['status']);
        var msgCommand = msgJSON['command'];

        if (msgStatus != 200){
            console.log('msgStatus !=200 -> stopPublisher()')
            stopPublisher();
        } else {

            var sdpData = setBandwidth(msgJSON['sdp']);

            if (sdpData !== undefined){
                console.log('sdp: ',sdpData);
                peerConnection.setRemoteDescription(new RTCSessionDescription(sdpData), function(){
                    //peerConnection.createAnswer(gotDescription, errorHandler);
                }, console.log);
            }

            var iceCandidates = msgJSON['iceCandidates'];
            if (iceCandidates !== undefined){
                for(var index in iceCandidates){
                    console.log('addIceCandidates: ',iceCandidates[index]);
                    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidates[index]));
                }
            }
        }

        if (wsConnection != null) wsConnection.close();
        wsConnection = null;

    }

    wsConnection.onclose = function(){
        console.log("wsConnection.onclose");
    }

    wsConnection.onerror = function(evt){
        console.log("wsConnection.onerror: ",evt);
    }

}


function startPublisher(){
    const visible = true;
    container.setState({visible})
    wsConnect(wsURL);
}

function stopPublisher(){
    if(peerConnection){
        if (localStream){
            peerConnection.removeStream(localStream);
            if (localStream){
                //  localStream.getTracks().forEach(t => t.stop());
                localStream.release();
            }
            localStream = null;
        }
    }
    if (peerConnection != null)
        peerConnection.close();
    peerConnection = null;

    if (wsConnection != null)
        wsConnection.close();
    wsConnection = null;

    console.log("stopPublisher");
}

export class BroadcastingView extends Component {

    static propTypes = {
        broadcastdata: React.PropTypes.object.isRequired,
    }

    constructor(props){
        super(props)
        container = this;
        this.state = {
            isFront: true,
            selfViewSrc: null,
            visible: true,
            layout:{
                height:height,
                width:width,
            },
            currentAppState: AppState.currentState,
        };

        console.ignoredYellowBox = [
            'Setting a timer'
        ];

        this.onBroadcastStart = this.onBroadcastStart.bind(this);

    }

    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange);
        this.onBroadcastStart();
    }

    componentWillMount(){
    }

    componentWillUnmount(){
        AppState.removeEventListener('change', this._handleAppStateChange);
        this._broadcaststop();
    }

    _broadcaststop(){
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
                stopPublisher();
                container= null;

            })
            .catch(err => {
                container= null;
                console.log("broadcast start fetch error" + err);
            });

    }

    _handleAppStateChange(currentAppState){
        container.setState({ currentAppState, });

        console.log('currentAppState',currentAppState);
    }



    onBroadcastStart(){
        console.log('onBroadcastStart');
        if (peerConnection == null) startPublisher();
    }

    onBroadcastEnd(){
        console.log('onBroadcastStop');
        stopPublisher();
    }

    onChangeMode(){
        console.log('onChangeMode');
        switchVideoType();
    }


    render(){
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
                    <ChatView 
                        onChangeMode={this.onChangeMode}
                        onBroadcastStart={this.onBroadcastStart}
                        onBroadcastEnd={this.onBroadcastEnd}
                        host_id={GlobalDataManager.user_id}
                        host_picture={GlobalDataManager.picture}
                        isBroad={true} broadcastid={this.props.broadcastdata.broadcast.broadcast_id}
                    />
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
