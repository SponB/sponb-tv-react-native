'use strict';

import React from 'react';
import {
  FlatList,
  View,
  Platform,
  Image,
  TouchableOpacity,
  Keyboard,
  AsyncStorage,
  ListView,
  TouchableHighlight,
  Text,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  screen,
  KeyboardAvoidingView
} from 'react-native';

import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';

import {InteractionManager} from 'react-native';
import SocketIOClient from 'socket.io-client';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import KeyboardListener from 'react-native-keyboard-listener';
import { Actions } from 'react-native-router-flux';
import DefaultPreference from 'react-native-default-preference';
import Icon from 'react-native-vector-icons/Ionicons';
import GridView from 'react-native-super-grid';
import {Avatar} from '../../components/avatar';
import Toast from 'react-native-root-toast';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import GlobalDataManager from '../.././data/globaldatamanager.js';
import Swiper from 'react-native-swiper';
import { Col, Row, Grid } from "react-native-easy-grid";
import FloatingHearts from 'react-native-floating-hearts'
import {UserListInRoomView,GiftinfoView,ReciveGiftView,GiftListView,UserInfoView,BroadUserListView} from './components'
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import LoadingOverlay from 'react-native-loading-overlay';
import _ from 'lodash';


let moment = require('moment');
import {FontAwesome} from '../../assets/icons';

var {height, width} = Dimensions.get('window');

var debug =	(console) ? console.log : function(){ };
var debugErr =	(console) ? console.error : function(){ };

let container;
let broadcastNickname;

function socketinit()
{
    container.socket.on('tvPong',function(){
    //debug('tvPong received')
      if (pongTimeout) clearTimeout(pongTimeout);
      pongTimeout = setTimeout(function(){
        domChat.addErrorMessage('Disconnected');
        clearTimeout(pongTimeout);
      }, 1e4);
    })

    container.socket.on('roomJoinError', function(err){
      debugErr('roomJoinError', err)
    });


    container.socket.on('connect', function(){
      debug('connect')
      container.socket.emit('room', container.props.broadcastid);
    })

    container.socket.on('disconnect', function(){
      debug('Socket disconnected')
    })

    container.socket.on('reconnect',function(data){
      //$chatMessages.empty();
      if(container !=null)
      {
    	   debug('reconnect event', container.socket.id, data);
        container.socket.emit('room', container.props.broadcastid);
      }
    });

    container.socket.on('sessionRequest',function(){
      debug('sessionRequest')
      if (undefined !== sessId && null !== sessId)
      container.socket.emit('phpsession', sessId);
    });

    container.socket.on('writeable', function(){
      debug('writeable')
    })

    container.socket.on('chatError', function(msg){
      debug('chatError', msg)
    })

    container.socket.on('userPrivileges', function(privileges){
      debug('userPrivileges', privileges)
    })

    container.socket.on('message', function(msg){
      debug('message', msg)
      // if(msg.user.user_id == GlobalDataManager.user_id)
      //    return;
      if(container && msg.room_id == container.props.broadcastid)
      {

        var msgs =  {
          nickname:msg.user.nickname,
          room_id:msg.room_id,
          user_id:msg.user.user_id,
          content:msg.content,
        };

        container._data.push(msgs);
        var rows = container._data;
        var rowIds = rows.map((row, index) => index).reverse();
        if (container.state.isMounted) {
            container.setState({
              dataSource: container.state.dataSource.cloneWithRows(rows, rowIds),
              heartcount: container.state.heartcount+1,
            });
          }
      }
    });

    container.socket.on('roomLoad',function(data){
      debug('roomLoad', data);
      if (container &&  container.state.isMounted) {
          container.setState({
            viewers: data.users.length-1,
            roomUsers:data.users,
            counters:data.counters,
            counthits:data.counters.hits,
            countlikes:data.counters.likes,
            onair:data.onair,

          });
        }
    });



    container.socket.on('itemGiftFeedback',function(data){
      debug('itemGiftFeedback', data);
      if(container &&  data.room_id == container.props.broadcastid)
      {
        if (container.state.isMounted) {


            async function getUser(userId){
                try{
                    return await _.find(container.state.roomUsers, ['user_id',  Number(userId)]);
                }
                catch(e){
                    console.log('caught error', e);
                    // Handle exceptions
                }

            }

           

              let product = container.state.itemGiftArray.map(function(num){
                if(num.id == data.item_id){

                  return num.name;
                }
              })

              console.log('product :'+product);
            
            

            getUser(data.user_id).then(foundUser=>{
                console.log('Found user : ', foundUser);
                container.setState({
                      giftProduct: product,
                      giftUserCount: data.qty,
                      giftUser_id:data.user_id,
                      giftUser_nickname:foundUser.nickname,
                      isReciveitem:true,
                });
            })

        }

        container._rectimer =  setTimeout(function () {
          if (container && container.state.isMounted) {
            container.setState({
              isReciveitem:false
            });
          }
        }, 3000);
      }

    });

    container.socket.on('roomInfo', function(data){
      debug('roomInfo',data);
      if (container && container.state.isMounted) {

        if (container.state.isMounted)
        {
          var unique  = _.uniqBy(data.users, function (e) {
              return e.user_id;
          });
          var users  = _.differenceBy(unique,[{ 'user_id': Number(GlobalDataManager.user_id) },{ 'user_id': Number(container.props.host_id) }], 'user_id');
          console.log('room users',users,container.props.host_id);
          var hostuser  =_.find(data.users, ['user_id',  Number(container.props.host_id)]);
          console.log('hostuser users',users);

          container.setState({
            viewers: data.users.length-1,
            roomUsers:data.users,
            counters:data.counters,
            counthits:data.counters.hits,
            countlikes:data.counters.likes,
            onair:data.onair,
            userdata:users,
            hostinfodata:hostuser,
            hostpicture:container.props.host_picture,

          });
          // if(!container.props.isBroad)
          // {
          //   if(data.onair)
          //   {
          //     container.props.onLiveStart();
          //   }else {
          //
          //     container.props.onLiveEnd();
          //   }
          //
          // }else {
          //
          //     container.props.onBroadcastStart();
          // }
        }
      }
    });

    container.socket.on('roomUsers',function(users){
      debug('roomUsers',users);

    })

    // Changing room
    container.socket.on('roomEnterInfo',function(data){
      debug('roomEnterInfo', data);
      if (container && container.state.isMounted) {
        container.setState({
          dataSource: container.state.dataSource.cloneWithRows(rows, rowIds),

        });
      }
    });

    container.socket.on('roomLeftInfo',function(data){
      debug('roomLeftInfo', data);

    });

    container.socket.on('info', function(msg){
      debug('info',msg)
    });

    container.socket.on('warning', function(msg){
      debug('warning',msg)
    });

    container.socket.on('error', function(msg){
      debug('error',msg)
    });

    container.socket.on('echo', function(event){
      debug('echo',event);
    });

    container.socket.on('gift', function(event){
      debug('gift',event);
    });

    container.socket.on('follow', function(event){
      debug('follow',event);
    });

    container.socket.on('like', function(event){
      debug('like',event);
      if (container.state.isMounted) {
        container.setState({
          heartcount: container.state.heartcount+1,
          countlikes:event.state?container.state.countlikes+1:container.state.countlikes-1,
        });
      }
    });

    container.socket.on('likeError', function(event){
      debug('likeError',event.message);
        container._showToast(event.message);
    });

    container.socket.on('kick', function(kick){
      debug('listen.kick');
      if(container)
      {
        container._showToast(GlobalDataManager.getstrings().chat_msg_kick);
        {Actions.Home()};
      }
    });
    container.socket.on('banned', function(kick){
      debug('Banned');
    });
    container.socket.on('promote', function(promoteObject){
      debug('listen.promote', promoteObject);
      if(container)
      {
        container.setState({
          isPromote: true,

        });
        container._showToast(GlobalDataManager.getstrings().chat_msg_promote);
      }
    })
    container.socket.on('demote', function(demoteObject){
      debug('listen.demote', demoteObject);
      if(container)
      {
         container.setState({
          isPromote: false,

        });

        container._showToast(GlobalDataManager.getstrings().chat_msg_demote);
      }
    })

    //Just in case
    container.socket.on('browserReload', function(){
        debug('browserReload')
    })

    container.socket.on('displayAlert', function(msg){
    })

    console.log('socketinit');

}



class ChatView extends React.Component {
  static propTypes = {
     broadcastid: React.PropTypes.string.isRequired,
     isBroad:React.PropTypes.bool.isRequired,
     host_id:React.PropTypes.string,
     host_picture:React.PropTypes.string
  }


  constructor(props) {
    super(props);

    container = this;
    this.socket = null;
    this._data = [];

    this.state = {
                  isMounted: false,
                  messages: [],
                  itemGiftArray: [],
                  nickname:'',
                  iskeyboardup:false,
                  footstatus:0,
                  itemGiftlist:[],
                  viewers:0,
                  counthits:0,
                  countlikes:0,
                  gift_id:'',
                  pay_id:'',
                  height:height,
                  keybordheight:0,
                  isVisivleblock:false,
                  isfavorite:true,
                  isPromote:false,
                  selectedUser:null,
                  giftUser_id:'',
                  giftUser_picture:'',
                  giftProduct:'',
                  giftUserCount:0,
                  isReciveitem:false,
                  counters:[],
                  onair:true,
                  hostinfodata:null,
                  heartcount:0,
                  isViewChat:true,
                  loadingOverlayVisible: false,
                  isOnlyView:false,
                  isVisivleChat:true,
                  hostpicture:this.props.host_picture,
                  top: new Animated.Value(0),
                  dataSource: new ListView.DataSource({
                    rowHasChanged: (r1, r2) => r1 !== r2,
                  }),
     };
     this.onKeyboardWillShow = this._onKeyboardWillShow.bind(this);
     this.onKeyboardWillHide = this._onKeyboardWillHide.bind(this);
     this.onkeyboardDidShow = this._keyboardDidShow.bind(this);
     this.onkeyboardDidHide = this._keyboardDidHide.bind(this);
  }

  componentDidMount() {

    this.setState({isMounted: true})

    if (Platform.OS === 'ios')
    {
      this.keyboardWillShowListner = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow);
      this.keyboardWillHideListner = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide);

    }else {

      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onkeyboardDidShow);
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onkeyboardDidHide);

    }
    console.log('componentDidMount');

    var request = {
        method: 'GET',
        headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/x-www-form-urlencoded',
           'X-WDTV-TOKEN':GlobalDataManager.token
         }
    };

    var url = 'https://tv.sponb.io/api/v1/broadcast/'+container.props.broadcastid;
    console.log('broadcast info',url);

    fetch(url, request)
        .then(response => {
            console.log('broadcast info response' , response);

           return response.json();})
        .then(responseData => {
         return responseData;

        })
        .then(data => {
            console.log('broadcast info data' , data.broadcast);
            var fdata = _.find(data.broadcast.flags, function(item){ return item == 'follow'; });
            
            broadcastNickname = data.user.nickname;

            console.log('broadcast info follow' , fdata);
            container.setState({
              isfavorite:fdata==null?false:true,
            });


            console.log('GlobalDataManager', GlobalDataManager);

            container.socket = SocketIOClient.connect('https://tv.sponb.io/socket.io' , {
              tvsession:GlobalDataManager.token,
              user_id: GlobalDataManager.user_id,
              transports:['websocket'],
              path:'/chat/socket.io',
              query:['user_id=',GlobalDataManager.user_id,'&','password=',''].join('')
            });

            console.log('SocketIOClient',container.socket);

            if(container.socket != null)
            {
                socketinit();


            }



            //  this._interval = setInterval(() => {
            //      container.setState({
            //        heartcount: container.state.heartcount+1,
            //      });
            //    }, 300);
             //
            //    setTimeout(function () {
            //     clearInterval(this._interval);
            //   }, 100000);

        })
        .catch(err => {
           container.setState({
             listdata: [],
             visible: false
           });
           console.log("broadcast info fetch error" + err);
        });


  }

  componentWillMount() {
  }

  componentWillUnmount()
  {
      if (Platform.OS === 'ios')
      {
        this.keyboardWillShowListner.remove();
        this.keyboardWillHideListner.remove();

      }else
      {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
      }

      clearTimeout(this._rectimer);
      if(this.socket)
      {
        console.log('chat componentWillUnmount');
        var comObj =  {
        };
        this.socket.emit('chat disconnect', comObj, function(result){
          debug('disconnect', result);
        })
        this.socket.disconnect();
        this.socket.close();
      }
        this.setState({isMounted: false})
    //    clearInterval(this._interval);
        container= null;
  }


  onSwipeUp(gestureState) {
    this.setState({myText: 'You swiped up!'});
  }

  onSwipeDown(gestureState) {
    this.setState({myText: 'You swiped down!'});
  }

  onSwipeLeft(gestureState) {
    this.setState({myText: 'You swiped left!',isViewChat:false});
  }

  onSwipeRight(gestureState) {
    this.setState({myText: 'You swiped right!',isViewChat:true});
  }

  onSwipe(gestureName, gestureState) {
    const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
    this.setState({gestureName: gestureName});
    switch (gestureName) {
      case SWIPE_UP:
      //  this.setState({backgroundColor: 'red'});
        break;
      case SWIPE_DOWN:
    //    this.setState({backgroundColor: 'green'});
        break;
      case SWIPE_LEFT:
    //    this.setState({backgroundColor: 'blue'});
        break;
      case SWIPE_RIGHT:
    //    this.setState({backgroundColor: 'yellow'});
        break;
    }
  }

  _showToast(msg)
  {
      let toast = Toast.show(msg, {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          onShow: () => {
              // calls on toast\`s appear animation start
          },
          onShown: () => {
              // calls on toast\`s appear animation end.
          },
          onHide: () => {
              // calls on toast\`s hide animation start.
          },
          onHidden: () => {
              // calls on toast\`s hide animation end.
          }
      });

      // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
      setTimeout(function () {
          Toast.hide(toast);
      }, 500);

  }


  _onPressLike()
  {
    Keyboard.dismiss();

    var comObj =  {
      room_id:container.props.broadcastid,
      state:true
    };

    console.log('_onPressLike');
    container.socket.emit('like', comObj, function(){
        console.log('like');

    })

  }

  onPressReport(content) {
      var comObj =  {
  			room_id:container.props.broadcastid,
  			content:content,
  		};


    console.log(content);
    container.socket.emit('report', comObj, function(result){
      debug('report', result);
      container.setState({
        footstatus:0,
      });
      container._showToast(GlobalDataManager.getstrings().chat_msg_room_report);
    })
  }



  onPressReportUser(content) {

    var comObj =  {
      room_id:container.props.broadcastid,
      user_id:container.state.selectedUser.user_id,
      content:content,
    };

    if(container.state.selectedUser == null)
    {
        container._showToast(GlobalDataManager.getstrings().chat_msg_user_select);
        return;
    }

    console.log(content);
    container.socket.emit('reportUser', comObj, function(result){
      debug('reportUser', result);
      container.setState({
        footstatus:0,
        selectedUser:null
      });
      container._showToast(GlobalDataManager.getstrings().chat_msg_user_report);
    })
  }

  _keyboardDidShow = (e) => {
    if (container && container.state.isMounted) {
      let newSize = Dimensions.get('window').height - e.endCoordinates.height
      console.log('_keyboardDidShow',e.endCoordinates.height);
      container.setState({
        iskeyboardup: true,
        height:newSize,
        keybordheight:e.endCoordinates.height
      })
    }
   }

  _keyboardDidHide = (e) => {
   let newSize = Dimensions.get('window').height
   if (container.state.isMounted) {
     container.setState({
      iskeyboardup: false ,
       height:newSize,
       keybordheight:0
     })
   }
  }

  _onKeyboardWillShow(e) {
    if (container && container.state.isMounted) {
      let newSize = Dimensions.get('window').height - e.endCoordinates.height
      console.log('_onKeyboardWillShow',e.endCoordinates.height);
      container.setState({
        iskeyboardup: true,
        height:newSize,
        keybordheight:e.endCoordinates.height
      })
    }
  }

  _onKeyboardWillHide(e) {
    let newSize = Dimensions.get('window').height
    if (container.state.isMounted) {
      container.setState({
       iskeyboardup: false ,
        height:newSize,
        keybordheight:0
      })
    }
  }

  _onPressMessage() {
    console.log('_onPressMessage');
    var comObj =  {
			nickname:container.state.nickname,
			room_id:container.props.broadcastid,
			content:container.state.message,
		};

    container.socket.emit('message', comObj, function(result){
      debug(result);
      if (result.ok===true){
      }else{
        debugErr('comment returned false');
      }
    })

    // var msg =  {
		// 	nickname:container.state.nickname,
		// 	room_id:container.props.broadcastid,
    //   user_id:container.state.user_id,
		// 	content:container.state.message,
		// };
    //
    // container._data.push(msg);
    // var rows = container._data;
    // // It's important to keep row IDs consistent to avoid extra rendering. You
    // // may need to reverse the list of row IDs so the so that the inversion
    // // will order the rows correctly.
    //
    // console.log('_onPressMessage',msg);
    //
    // var rowIds = rows.map((row, index) => index).reverse();
    if (container.state.isMounted) {
      container.setState({
        message: '',
      });
    }
  }

  _onPressfavorite() {

    var request = {
        method: 'POST',
        headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/x-www-form-urlencoded',
           'X-WDTV-TOKEN':GlobalDataManager.token
         }
    };
    var api = container.state.isfavorite==false?'follow':'unfollow';
    console.log('api',api)
    var url = 'https://tv.sponb.io/api/v1/broadcast/'+container.props.broadcastid+'/'+api;
    console.log('follow',url);

    fetch(url, request)
        .then(response => {
            console.log('response' , response);
           return response.json();})
        .then(responseData => {
         console.log('broadcast start' , responseData);
         return responseData;

        })
        .then(data => {
          container.setState({
            isfavorite: !container.state.isfavorite,
          });

          if(container.state.isfavorite)
          {
            container._showToast('followed');

          }else {
            container._showToast('Unfollowed');
          }
        })
        .catch(err => {
            console.log("follow fetch error" + err);
        });
  }


  _onPressgift() {
    console.log('_onPressgift', container.socket);
    var comObj =  {
    };
    container.socket.emit('itemList', comObj, function(error,result){
      debug('itemList', error);
      debug('itemList', result);

       container.setState({
                      itemGiftArray: result,
                     
                    });

     // console.log('itemGiftArray :'+container.state.itemGiftArray);
      container.setState({
        loadingOverlayVisible: true,
      });

      if(error == null)
      {
        if (container.state.isMounted) {
          container.setState({
            footstatus: 1,
            itemGiftlist:result
          });
        }
      }else {

      }

      container.setState({
        loadingOverlayVisible: false,
      });

    })
    // container.setState({
    //   footstatus: 1,
    //   itemGiftlist:[{ name:'dd',coins:'1000',description:'2weewqeqwewq'}]
    // });
  }



  onSelectGiftItem(item)
  {
    if (container.state.isMounted) {
      container.setState({
         gift_id: item.id,
       });
    }
  }


  onPressSendGift(item_id,name,count)
  {
    var comObj =  {
      item_id:item_id,
      product: name,
      room_id:container.props.broadcastid,
      qty:count,
    };

    if(container.socket == null)
      return;

    console.log('_sendGiftitem',comObj);
    container.socket.emit('itemGift', comObj, function(error,result){
      debug('itemGift', error);
      debug('itemGift', result);
      if(result)
      {

        
        container._showToast(GlobalDataManager.getstrings().chat_msg_gift_send);
        if (container.state.isMounted) {
          container.setState({footstatus: 0});
        }
      }
    })
  }



  _focus() {
    //this.chatvisible = true;
    // if (Platform.OS === 'ios') {
    //   this.refs.list.scrollToEnd();
    // } else {
    //   _.delay(() => this.refs.list.scrollToEnd(), 100);
    // }
    if (container.state.isMounted) {
      container.setState({
        footstatus: 0,
      });
    }
  }


  _onPressClose() {
    Actions.Home();
  }

  onPressKick()
  {

    if (container.state.isMounted) {

      if(container.state.selectedUser == null)
      {
          container._showToast(GlobalDataManager.getstrings().chat_msg_user_select);
          return;
      }

      console.log('onPressAppoint');
      var comObj =  {
        room_id:container.props.broadcastid,
        user_id:container.state.selectedUser.user_id,
      };

      container.socket.emit('kick', comObj, function(){
        container._showToast(GlobalDataManager.getstrings().chat_msg_kick_ok);
        console.log('kick');
        container.setState({
          footstatus:0,
          selectedUser:null,
        });
      })
    }

  }

  onPressAppoint()
  {

    if (container.state.isMounted) {
      if(container.state.selectedUser == null)
      {
          container._showToast(GlobalDataManager.getstrings().chat_msg_user_select);
          return;
      }
      console.log('onPressAppoint');

      var comObj =  {
        room_id:container.props.broadcastid,
        user_id:container.state.selectedUser.user_id,
      };
      container.socket.emit('promote', comObj, function(){
        console.log('promote');
        container._showToast(GlobalDataManager.getstrings().chat_msg_appoint_ok);
        container.setState({
          footstatus:0,
          selectedUser:null
        });
      })
    }
  }


_showchatview()
{
    if (container.state.isMounted) {
     container.setState({
       isVisivleChat: !container.state.isVisivleChat,
       });
      Keyboard.dismiss();
      console.log('_showchatview',container.state.isVisivleChat);
   }

}

  _onPressUser()
  {
    if (container.state.isMounted) {
      if(container.state.hostinfodata==null)
      {
        container._showToast(container.props.host_id+GlobalDataManager.getstrings().chat_msg_no_room);
        return;
      }

       container.setState({
         footstatus: 3,
         isOnlyView:container.props.isBroad?false:true,
         selectedUser:container.state.hostinfodata
       });
     }
  }

  _onPressUserList() {
    console.log('_onPressUserList');
    var comObj =  {
      room_id:container.props.broadcastid,
    };
    if(container.socket==null)
      return;

    container.setState({
      loadingOverlayVisible: true,
    });

    container.socket.emit('userList', comObj, function(error,result){
      debug('userList', error);
      debug('userList', result);
      if(error == null)
      {
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        if (container.state.isMounted) {

            var unique  = _.uniqBy(result, function (e) {
              return e.user_id;
            });

          var users  = _.differenceBy(unique,[{ 'user_id': Number(GlobalDataManager.user_id) },{ 'user_id': Number(container.props.host_id) }], 'user_id');
          console.log('finde users',users);

          container.setState({
            footstatus: 2,
            dataSourceUser:ds.cloneWithRows(users),
            userdata:users
          });
        }
      }else {

      }

      container.setState({
        loadingOverlayVisible: false,
      });
    })

    //  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    // container.setState({
    //   footstatus: 2,
    //   dataSourceUser:ds.cloneWithRows([{name:'dddd',user_id:'dddd'}])
    // });

  }

  onPressCloseBroadUserList()
  {
    this.setState({footstatus: 0});
  }

  onPressCloseUserInfo()
  {
    this.setState({footstatus: 0});
  }


  onPressCloseGiftList()
  {
    this.setState({footstatus: 0});
  }

  dropdown_onSelect(value)
  {
    if (container.state.isMounted) {
      container.setState({
      });
    }
  }

  onPressUserRow(selectedUser)
  {
     console.log('onPressUserRow',selectedUser);
     if (container.state.isMounted) {
        container.setState({
          selectedUser:selectedUser,
          footstatus: 3,
          isOnlyView:container.props.isBroad?false:true,
        });
      }
  }

  _renderRow(row) {
    console.log('_renderRow',row);
    return <View style={styles.container}><Text style={{  color: 'white',
      fontSize: 13,
      fontWeight: "bold",
      left:2}}>{row.nickname}:{row.content}</Text></View>
  }


  _chatvisible()
  {
    if(this.state.iskeyboardup == true)
    {
      return (
          <View style={styles.footerbutton}>
          <RkButton onPress={() => this._onPressMessage()} style={styles.send} rkType='circle highlight'>
            <Image source={require('../../assets/icons/sendIcon.png')}/>
          </RkButton>
        </View>
      );

    }else {

      if(container.props.isBroad == true)
      {
        return (
            <View style={styles.footerbutton}>
            <RkButton onPress={() => this._onPressMessage()} style={styles.send} rkType='circle highlight'>
              <Image source={require('../../assets/icons/sendIcon.png')}/>
            </RkButton>
          </View>
        );

      }else {

        return (
            <View style={styles.footerbutton}>
            <RkButton onPress={() => this._onPressfavorite()} style={ {
              width: 40,
              height: 40,
              marginLeft: 10,
              backgroundColor:'gray',
            }} rkType='circle highlight'>
              <Icon size={20} name='md-star' color={this.state.isfavorite==true?'yellow':'white'} />
            </RkButton>
            <RkButton onPress={() => this._onPressgift()} style={ {
              width: 40,
              height: 40,
              marginLeft: 10,
              backgroundColor:'gray',
            }} rkType='circle highlight'>
              <Icon size={18} name='md-basket' color="#fff" />
            </RkButton>
          </View>
        );
      }
    }
  }

  _footView()
  {
    if(this.state.footstatus == 0)//기본 채팅창
    {
          return (
              //<TouchableWithoutFeedback onPress={() =>  this._onPressLike()}>
              <View style={{
                             position: 'absolute',
                             height:height-150,
                             left: 0,
                             right:0,
                             bottom:Platform.OS === 'ios'?this.state.keybordheight:0,
                             backgroundColor: 'rgba(255,0,0,0)' }}>
                  <ListView
                          renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
                          dataSource={this.state.dataSource}
                          renderRow={this._renderRow.bind(this)}
                          style={{
                            position: 'absolute',
                            paddingHorizontal: 0,
                            height:250,
                            bottom:90,
                            left: 0,
                            width:200,
                            backgroundColor: 'rgba(0,0,0,0.05)'

                          }}
                        />



                     

                          <TouchableWithoutFeedback onPress={() =>  this._onPressLike()}>
                        
                    <View style={{ position: 'absolute',
                      bottom: 40,
                      left:280,
                      width:180,
                      height:250,
                      backgroundColor: 'rgba(0,0,0,0)'}}>

                       <FloatingHearts color='red' count={container.state.heartcount}/>
                      
                    </View>

                        </TouchableWithoutFeedback>

                           <View style={{ position: 'absolute',
                      bottom: 80,
                      right:5,
                      width:50,
                      height:50,
                      backgroundColor: 'rgba(0,0,0,0)'}}>

                       <RkButton style={styles.close} rkType='clear'  onPress={() =>  this._onPressLike()}>
                         <Icon size={35} name='ios-heart' color="#fff" />

                      
                          </RkButton>

    
                      </View>



                   
                    
                  <View style={styles.footer}>
                    <RkButton style={styles.plus} onPress={() => this.setState({message:'',})} rkType='clear'>
                       <Icon size={25} name='ios-add' color="#000" />
                    </RkButton>
                    <RkTextInput
                      onFocus={() => this._focus(true)}
                      onChangeText={(message) => this.setState({message})}
                      value={this.state.message}
                      rkType='row sticker'
                      placeholder="Add a comment..."/>
                      {this._chatvisible()}
                  </View>
              </View>



            //</TouchableWithoutFeedback>



      );



    }else if(this.state.footstatus == 1) //선물하기
    {
          return (
              <GiftListView dropdown_onSelect={this.dropdown_onSelect.bind(this)}
                            itemGiftlist={this.state.itemGiftlist}
                            onPressSendGift={this.onPressSendGift.bind(this)}
                            onSelectGiftItem={this.onSelectGiftItem.bind(this)}
                            onPressCloseGiftList={this.onPressCloseGiftList.bind(this)}/>
                )
    }else if(this.state.footstatus == 2) //룸이용자
    {
         return (
              <BroadUserListView isBroad={container.props.isBroad}
                           isPromote={container.state.isPromote}
                           dataSourceUser={this.state.dataSourceUser}
                           onPressUserRow={this.onPressUserRow.bind(this)}
                           onPressCloseBroadUserList={this.onPressCloseBroadUserList.bind(this)}/>
              )
    }else if(this.state.footstatus == 3) //유저정보
    {
         return (
              <UserInfoView
                           isOnlyView = {container.state.isOnlyView}
                           isBroad={container.props.isBroad}
                           isPromote={container.state.isPromote}
                           selectedUser={container.state.selectedUser}
                           onPressReportUser={this.onPressReportUser.bind(this)}
                           onPressKick={this.onPressKick.bind(this)}
                           onPressAppoint={this.onPressAppoint.bind(this)}
                           onPressReport={this.onPressReport.bind(this)}
                           onPressCloseUserInfo={this.onPressCloseUserInfo.bind(this)}/>
              )
    }

  }

  render() {
    const config = {
     velocityThreshold: 0.3,
     directionalOffsetThreshold: 80
   };
  //  <GestureRecognizer
  //      onSwipe={(direction, state) => this.onSwipe(direction, state)}
  //      onSwipeUp={(state) => this.onSwipeUp(state)}
  //      onSwipeDown={(state) => this.onSwipeDown(state)}
  //      onSwipeLeft={(state) => this.onSwipeLeft(state)}
  //      onSwipeRight={(state) => this.onSwipeRight(state)}
  //      config={config}
  //      style={{
  //        flex: 1,
  //        backgroundColor: this.state.backgroundColor
  //      }}
  //      >


    return (
        <View style={styles.container}>
           <View style={styles.title}>
              <View style={{flex:1 , height:90, flexDirection: 'column' , backgroundColor:'rgba(0,0,0,0)'}}>

                {this.state.isVisivleChat?(<UserListInRoomView
                                                  userdata={this.state.userdata}
                                                  onPressUserList={this._onPressUserList.bind(this)}
                                                  onPressUser={this._onPressUser.bind(this)}
                                                  host_id={broadcastNickname}
                                                  host_picture={this.state.hostpicture}
                                                  viewers={this.state.viewers}/>):null}
               {this.state.isVisivleChat?(<GiftinfoView
                                                  count_hits={this.state.counthits}
                                                  count_likes={this.state.countlikes} />):null}

                {container.props.isBroad==true?(<RkButton style={styles.camswitch} rkType='clear'  onPress={container.props.onChangeMode}>
                  <SimpleLineIcons name="camera" size={20} color="#FFFFFF"  style={{marginTop:0,marginBottom:0,marginLeft:0,marginRight:0}}/>
                </RkButton>):null}
                <RkButton style={styles.chatswitch} rkType='clear'  onPress={() => this._showchatview()}>
                  <Octicons name="keyboard" size={20} color="#FFFFFF"  style={{marginTop:0,marginBottom:0,marginLeft:0,marginRight:0}}/>
                </RkButton>
              </View>
              <RkButton style={styles.close} rkType='clear'  onPress={() =>  this._onPressClose()}>
               <Icon size={35} name='md-close' color="#fff" />
              </RkButton>
          </View>
          {this.state.isReciveitem==true?
            (<View style={{position: 'absolute',left:0,borderRadius:20, height:50,width:250,marginTop:250, flexDirection: 'column' , backgroundColor:'rgba(255,0,0,0.3)'}}>
              <ReciveGiftView giftUser_picture={this.state.giftUser_picture} giftUser_id={this.state.giftUser_id}  giftUser_nickname={this.state.giftUser_nickname} giftProduct={this.state.giftProduct} giftUserCount={this.state.giftUserCount}/>
          
            </View>):null}
          <View style={{ backgroundColor:'rgba(255,0,0,1)',  justifyContent: 'flex-start'}}>
          </View>

          {this.state.isVisivleChat?this._footView():null}

          <LoadingOverlay visible={this.state.loadingOverlayVisible}/>
        </View>
    );
  }
}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    marginTop:0,
    flex: 1,
    backgroundColor: theme.colors.screen.base
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  containerlistIos: {
    flex: 1,
    backgroundColor: 'rgba(255,0,0,0)'
  },
  list: {
    paddingHorizontal: 5,
    marginTop:350,
    marginRight:150,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  footerIos: {
    flexDirection: 'row',
    minHeight: 60,
    padding: 10,
    backgroundColor: theme.colors.screen.alter
  },
  footer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    minHeight: 60,
    padding: 10,
    backgroundColor: theme.colors.screen.alter
  },
  footerbutton: {
    flexDirection: 'row',
    minHeight: 60,
    padding: 10,
    backgroundColor: theme.colors.screen.alter
  },
  plus: {
    paddingVertical: 20,
    marginRight: 7
  },
  send: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  title: {
    marginTop:Platform.OS === 'ios'?20:5,
    height:80,
    zIndex:2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255,0,0,0)'
  },
  close: {
      position: 'absolute',
      top:5,
      right:10,
  },
  camswitch: {
      position: 'absolute',
      top:55,
      right:10,
  },
  chatswitch: {
      position: 'absolute',
      top:55,
      right:50,
  },
}));

module.exports = ChatView;
