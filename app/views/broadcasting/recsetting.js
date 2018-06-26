'use strict';

import React, {
    Component
} from 'react'

import {
  View,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  screen,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';

import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard, RkStyleSheet
} from 'react-native-ui-kitten';


import {Avatar} from '../../components/avatar';
import {FontAwesome} from '../../assets/icons';
import {GradientButton} from '../../components/';
import {RkTheme} from 'react-native-ui-kitten';
import {scale, scaleModerate, scaleVertical} from '../../utils/scale';
import { Actions } from 'react-native-router-flux';
import store from 'react-native-simple-store';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Icon from 'react-native-vector-icons/Ionicons';
import GlobalDataManager from '../.././data/globaldatamanager.js';

export class RecSettingView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            title:'',
            top: new Animated.Value(0),
          };

        this.onKeyboardWillShow = this._onKeyboardWillShow.bind(this);
        this.onKeyboardWillHide = this._onKeyboardWillHide.bind(this);
        this.onkeyboardDidShow = this._keyboardDidShow.bind(this);
        this.onkeyboardDidHide = this._keyboardDidHide.bind(this);
    }

     _keyboardDidShow = (e) => {
        console.log('_keyboardDidShow',e);
        Animated.timing(this.state.top, {
          toValue: -(e.endCoordinates.height/3),
          duration: 10,
        }).start();
     }

     _keyboardDidHide = (e) => {
       console.log('_keyboardDidHide',e);
       Animated.timing(this.state.top, {
         toValue: 0,
         duration: 10,
       }).start();
     }

     _onKeyboardWillShow(e) {
         console.log('_onKeyboardWillShow',e);
       Animated.timing(this.state.top, {
         toValue: -(e.startCoordinates.height/2.5),
         duration: e.duration,
       }).start();
     }

     _onKeyboardWillHide(e) {
         console.log('_onKeyboardWillHide',e);
       Animated.timing(this.state.top, {
         toValue: 0,
         duration: e.duration,
       }).start();
     }

    componentDidMount () {
    }

    componentWillMount() {
      if (Platform.OS === 'ios')
      {
        this.keyboardWillShowListner = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow);
        this.keyboardWillHideListner = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide);

      }else {

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onkeyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onkeyboardDidHide);

      }
    }

    componentWillUnmount() {
      if (Platform.OS === 'ios') {
        this.keyboardWillShowListner.remove();
        this.keyboardWillHideListner.remove();
      }else {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();

      }
    }

    _StartAPI() {
      if(this.state.title.length==0)
      {
        Alert.alert(
              '',
              GlobalDataManager.getstrings().broadcate_msg_title_input,
              [
                {text: 'OK', onPress: () => console.log('input title error')},
              ]
            )
          return;
      }
        // {Actions.Recoding()};
        // return;

      console.log('token' , GlobalDataManager.token) //
      console.log('user' , GlobalDataManager.user_id) //

      Keyboard.dismiss();

      var body = new FormData();
      body.append('category_id', '0');
      body.append('title', this.state.title);
      body.append('description', '');
      body.append('max_viewers', 999);
      body.append('price', 1000);
      body.append('quality', 'good');
      body.append('chatting', 1);
      body.append('access', 'o');
      body.append('password', '');

      console.log('body',body);
      var request = {
          method: 'POST',
          headers: {
             'Accept': 'application/json',
             'Content-Type': 'multipart/form-data',
             'X-WDTV-TOKEN':GlobalDataManager.token
           },
          body: body
      };

      fetch('https://tv.sponb.io/api/v1/broadcast/start', request)
          .then(response => {
              console.log('response' , response);
             return response.json();})
          .then(responseData => {
               console.log('broadcast start' , responseData);
               return responseData;

          })
          .then(data => {
              console.log('data' , data);
             {Actions.Recoding({broadcastdata:data})}
          })
          .catch(err =>  console.log("broadcast start fetch error" + err));

    }

    render() {

      return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[screen, {top: this.state.top}]} onResponderRelease={(event) => {
              Keyboard.dismiss();
            }}>
             <View style={styles.title}>
               <RkButton style={styles.close} rkType='clear'  onPress={() =>   Actions.Home()}>
                   <Icon size={35} name='md-close-circle' color="rgba(0,0,0,1)" />
               </RkButton>
            </View>
             <View style={styles.content}>
               <View style={{marginVertical:60}}>
                 <Avatar img={GlobalDataManager.picture} rkType='big'/>
                 <RkTextInput style={{marginHorizontal:20}}   onChangeText={(title) => this.setState({title})} value={this.state.title} placeholder={GlobalDataManager.getstrings().broadcate_text_title}/>
               </View>
                 <View style={styles.textRow}>
                   <RkButton style={{marginVertical:0}}  onPress={() =>   this._StartAPI()}>
                     <RkText  style={{color:'white', fontSize:20}}> {GlobalDataManager.getstrings().broadcate_btn_start} </RkText>
                   </RkButton>
                 </View>
             </View>
         </Animated.View>
       </TouchableWithoutFeedback>
      )
    }
}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    marginTop:0,
    flex: 1,
    backgroundColor: theme.colors.screen.base
  },
  title: {
      marginTop:20,
      height:40,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0)'
  },
  image: {
    height: scaleVertical(77),
    resizeMode: 'contain'
  },
  header: {
    paddingBottom: scaleVertical(10),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  content: {
    justifyContent: 'space-between'
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: scaleVertical(24),
    marginHorizontal: 24,
    justifyContent: 'space-around',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    borderColor: theme.colors.border.solid
  },
  close: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  footer: {}
}));
