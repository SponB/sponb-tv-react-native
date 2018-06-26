'use strict';

import React from 'react';
import {
  View,
  Platform,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  Text,
  style,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';

import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';


import Icon from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { Actions } from 'react-native-router-flux';


let container;
export default class TabBarView extends React.Component {

  static propTypes = {
  }

  constructor(props) {
    super(props);
    container = this;
    this.state = {
     };
  }
  componentDidMount() {
    console.log('TabBarView',container.props);
  }
  componentWillMount() {
  }
  componentWillUnmount() {
  }
  render() {
    return(
      <View style={{flex:1 , alignItems: 'center'}}>
        <View style={{flex:1 ,flexDirection: 'row',  marginBottom:0, backgroundColor:'ghostwhite'}}>

          <View style={{flex:1 , alignItems: 'center', justifyContent: 'center', backgroundColor:'ghostwhite'}}>
            <TouchableHighlight style={{flex:1 , alignItems: 'center', justifyContent: 'center', backgroundColor:'ghostwhite'}} onPress={Actions.Home}>
              <Icon style={{color: this.props.isHome?'#FF5E00':'gray', marginBottom:Platform.OS === 'ios'?0:20}} name='ios-home' size={ Platform.OS === 'ios'?30:30} />
            </TouchableHighlight>
          </View>

           <View style={{flex:1 , alignItems: 'center', justifyContent: 'center', backgroundColor:'ghostwhite'}}>
            <TouchableHighlight onPress={Actions.Heart}>
              <Icon style={{color: this.props.isHeart?'#FF5E00':'gray', marginBottom:Platform.OS === 'ios'?0:20}} name='ios-heart' size={ Platform.OS === 'ios'?30:30} />
            </TouchableHighlight>
          </View>

          <View style={{flex:1 ,alignItems: 'center', justifyContent: 'center', backgroundColor:'ghostwhite'}}>
            <TouchableHighlight onPress={Actions.BroadCast}>
            <View style={{flex: 1, padding:0, flexDirection: 'column',width:200 , height:50, alignItems: 'center',backgroundColor:'rgba(0,0,0,0)'}}>
              <View style={{position: 'absolute', top:-20 , width:80 , height:80, borderColor:'ghostwhite', backgroundColor:'ghostwhite', borderRadius:50 , borderWidth:1}}/>
              <View style={{alignItems: 'center', justifyContent: 'center',position: 'absolute', top:(Platform.OS === 'ios'?-10:5) , width:40 , height:40, borderColor:'#FF5E00', backgroundColor:'#FF5E00', borderRadius:50 , borderWidth:1}}>
                <Icon style={{color: 'white'}} name='ios-videocam' size={ Platform.OS === 'ios'?30:30} />
              </View>
            </View>
            </TouchableHighlight>
          </View>

           <View style={{flex:1 , alignItems: 'center', justifyContent: 'center', backgroundColor:'ghostwhite'}}>
            <TouchableHighlight onPress={Actions.Notification}>
              <Icon style={{color: this.props.isNotification?'#FF5E00':'gray', marginBottom:Platform.OS === 'ios'?0:20}} name='ios-notifications' size={ Platform.OS === 'ios'?30:30} />
            </TouchableHighlight>
          </View>

          <View style={{flex:1 ,alignItems: 'center', justifyContent: 'center', backgroundColor:'ghostwhite'}}>
            <TouchableHighlight onPress={Actions.Favorites}>
            <Icon style={{color: this.props.isFavorite?'#FF5E00':'gray', marginBottom:Platform.OS === 'ios'?0:20}} name='ios-star' size={ Platform.OS === 'ios'?30:30} />
            </TouchableHighlight>
          </View>
        </View>
      </View>
        )
      }
}


let styles = RkStyleSheet.create(theme => ({
}));
