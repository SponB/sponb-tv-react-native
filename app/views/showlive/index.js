'use strict';
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

import io from 'socket.io-client';
import Video from 'react-native-video';

import ChatView  from '../chat'
import LoadingOverlay from 'react-native-loading-overlay';
import { BlurView } from 'react-native-blur';
import CloseView from './close.js'
import KeepAwake from 'react-native-keep-awake';


let container;
var {height, width} = Dimensions.get('window');

export  class ShowLive extends Component {
    static propTypes = {
     broadcastdata: React.PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props)

      container = this;
      this.socket = null;

      this.state = {
        info: 'Initializing',
        status: 'init',
        loadingOverlayVisible: true,
        viewRef: null,
        mode:1,
        layout:{
         height:height,
         width:width,
        },
        rate: 1,
        volume: 1,
        muted: false,
        resizeMode: 'stretch',
        duration: 100000.0,
        currentTime: 0.0,
        paused: false,
        isBuffering:false,
        uri: this.props.broadcastdata.broadcast.hls,
//        uri: 'http://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8',
        currentAppState: AppState.currentState,
      };


      console.ignoredYellowBox = [
              'Setting a timer'
          ];

      this.onLiveStart = this.onLiveStart.bind(this);
      this.onLiveEnd = this.onLiveEnd.bind(this);
      this.onLiveVideoEnd = this.onLiveVideoEnd.bind(this);
      this.onVideoError = this.onVideoError.bind(this);
      this.onLoadStart = this.onLoadStart.bind(this);
      this.onBuffer = this.onBuffer.bind(this);

    }

    imageLoaded()
    {
      container.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    onLiveStart()
    {
      container.setState({ mode:0, loadingOverlayVisible: false });
      console.log('onLiveStart');
    }

    onLiveEnd()
    {
      console.log('onLiveEnd');
      container.setState({ mode:2, loadingOverlayVisible: false });
    }


    onLiveVideoEnd(event)
    {
      console.log('onLiveVideoEnd',event);
      container.setState({ mode:2, loadingOverlayVisible: false });
    }


    componentDidMount () {

    }

    componentWillUnmount() {
    }

    onLoad(data) {
      console.log('On load fired!',data.duration);
      container.setState({ mode:0, loadingOverlayVisible: false });
    }

    onProgress(data) {
      console.log('currentTime',data.currentTime);
    }

    onBuffer({ isBuffering }: { isBuffering: boolean }) {
      console.log('isBuffering',isBuffering);
      if(!isBuffering)
      {
//        this.player.seek(0);
      }
      container.setState({isBuffering: isBuffering });
    }

    onLoadStart()
    {
      console.log('loadStart');
    }

    onVideoError(error)
    {
      console.log('videoError',error);
      // Alert.alert(
      //       'onVideoError',
      //       'error '+ JSON.stringify(error),
      //       [
      //         {text: 'OK', onPress: () => this.onLiveEnd()},
      //       ]
      //     )

      this.onLiveEnd();
      //  this.setState({ mode:2, loadingOverlayVisible: false });
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
            source={{uri:this.props.broadcastdata.broadcast.thumbnail.toString()}}
            style={{  width: container.state.layout.width,
              height:  container.state.layout.height,}}
            onLoadEnd={this.imageLoaded.bind(this)}
          />{this._isBlur()}
          <LoadingOverlay visible={this.state.loadingOverlayVisible}/>
          <LoadingOverlay visible={this.state.isBuffering} />

         </View>)

      }else if(this.state.mode==2){
          this.setState({mode: 0})

          return (
            
             <View style={styles.Blur}>
          <Image
            ref={(img) => { this.backgroundImage = img; }}
            source={{uri:this.props.broadcastdata.broadcast.thumbnail.toString()}}
            style={{  width: container.state.layout.width,
              height:  container.state.layout.height,}}
            onLoadEnd={this.imageLoaded.bind(this)}
          />{this._isBlur()}
          <LoadingOverlay visible={false}/>
          <LoadingOverlay visible={false} />

         </View>

          // <View style={styles.floatView}>
           //   <CloseView thumbnail={this.props.broadcastdata.broadcast.thumbnail.toString()}/>
           // </View> 

          )
      }
    }

    render() {
//      console.log('uri',this.state.uri);
      return (
        <View style={styles.parent}>
            <KeepAwake />
            <View style={styles.fullScreen}>
              {Platform.OS == 'ios'?
                  <Video
                      ref={(ref) => {
                       this.player = ref
                      }}
                      source={{uri:this.state.uri}}
                      style={styles.videoNormalFrame}
                      rate={this.state.rate}
                      paused={this.state.paused}
                      volume={this.state.volume}
                      muted={this.state.muted}
                      resizeMode={this.state.resizeMode}
                      playInBackground={false}                // Audio continues to play when app entering background.
                      playWhenInactive={true}                // [iOS] Video continues to play when control or notification center are shown.
                      onLoadStart={this.onLoadStart}            // Callback when video starts to load
                      onLoad={this.onLoad}               // Callback when video loads
                      onEnd={this.onLiveVideoEnd}                      // Callback when playback finishes
                      onError={this.onVideoError}               // Callback when video cannot be loaded
                      onBuffer={this.onBuffer}                // Callback when remote video is buffering
                      onReadyForDisplay={(event)=>{this.player.seek(0);console.log('onReadyForDisplay',event)}}
                      onPlaybackStalled={(event)=>{console.log('onPlaybackStalled',event)}}
                      onPlaybackResume={(event)=>{this.setState({paused:false}); console.log('onPlaybackResume',event)}}
                      onPlaybackRateChange={(event)=>{console.log('onPlaybackRateChange',event)}}
                      onAudioFocusChanged={()=>{console.log('onAudioFocusChanged')}}
                      onAudioBecomingNoisy={()=>{console.log('onAudioBecomingNoisy')}}
                      onVideoLoadStart={(event)=>{console.log('onVideoLoadStart',event)}}
                      onVideoLoad={(event)=>{console.log('onVideoLoad',event)}}
                      onVideoBuffer={(event)=>{console.log('onVideoBuffer',event)}}
                      onVideoError={this.onVideoError}
                      onVideoProgress={(event)=>{console.log('onVideoProgress',event)}}
                      onVideoSeek={(event)=>{ console.log('onVideoSeek',event)}}
                      onVideoEnd={(event)=>{console.log('onVideoEnd',event)}}
                      onTimedMetadata={(event)=>{console.log('onTimedMetadata',event)}}
                      repeat={false}
                      />
                  :<Video
                      ref={(ref) => {
                       this.player = ref
                      }}
                      source={{uri: this.props.broadcastdata.broadcast.hls}}
                      style={styles.videoNormalFrame}
                      rate={this.state.rate}
                      paused={this.state.paused}
                      volume={this.state.volume}
                      muted={this.state.muted}
                      resizeMode={this.state.resizeMode}
                      onLoadStart={this.onLoadStart}            // Callback when video starts to load
                      onLoad={this.onLoad}               // Callback when video loads
                      onEnd={this.onLiveVideoEnd}                      // Callback when playback finishes
                      onError={this.onVideoError}               // Callback when video cannot be loaded
                      onBuffer={this.onBuffer}                // Callback when remote video is buffering
                      onReadyForDisplay={(event)=>{this.player.seek(0);console.log('onReadyForDisplay',event)}}
                      onPlaybackStalled={(event)=>{console.log('onPlaybackStalled',event)}}
                      onPlaybackResume={(event)=>{this.setState({paused:false}); console.log('onPlaybackResume',event)}}
                      onPlaybackRateChange={(event)=>{console.log('onPlaybackRateChange',event)}}
                      onAudioFocusChanged={()=>{console.log('onAudioFocusChanged')}}
                      onAudioBecomingNoisy={()=>{console.log('onAudioBecomingNoisy')}}
                      onVideoLoadStart={(event)=>{console.log('onVideoLoadStart',event)}}
                      onVideoLoad={(event)=>{console.log('onVideoLoad',event)}}
                      onVideoBuffer={(event)=>{console.log('onVideoBuffer',event)}}
                      onVideoError={this.onVideoError}
                      onVideoProgress={(event)=>{console.log('onVideoProgress',event)}}
                      onVideoSeek={(event)=>{ console.log('onVideoSeek',event)}}
                      onVideoEnd={(event)=>{console.log('onVideoEnd',event)}}
                      onTimedMetadata={(event)=>{console.log('onTimedMetadata',event)}}
                      repeat={false}
                    />}

               <ChatView onLiveStart={this.onLiveStart}
                         onLiveEnd={this.onLiveEnd}
                         host_id={this.props.broadcastdata.user.user_id}
                         host_picture={this.props.broadcastdata.user.picture}
                         isBroad={false}
                         broadcastid={this.props.broadcastdata.broadcast.broadcast_id}/>
            </View>
             {this._getViewStatus()}
         </View>
      )
    }
}


const styles = StyleSheet.create({
  videoNormalFrame: {
      position: 'absolute',
      top:0,
      left: 0,
      width: width,
      height: height,
  },
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
    backgroundColor: 'black',
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
