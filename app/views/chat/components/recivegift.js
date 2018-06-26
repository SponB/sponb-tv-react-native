'use strict';

import React from 'react';
import {
  View,
  Platform,
  Image,
  TouchableOpacity,
  AsyncStorage,
  ListView,
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
import {Avatar} from '../../../components/avatar';
import GlobalDataManager from '../../.././data/globaldatamanager.js';

let container;
export class ReciveGiftView extends React.Component {

  constructor(props) {
    super(props);
    container = this;
    this.state = {
     };
  }
  componentDidMount() {
  }
  componentWillMount() {
  }
  componentWillUnmount() {
  }

  render() {
    return(
        <View style={{flex:1 ,height:50,flexDirection: 'row',marginLeft:5,alignItems: 'center',}}>
          <View style={{flex:1 , flexDirection: 'row', justifyContent: 'space-between',alignItems: 'center'}}>
            <View style={{ flexDirection: 'row',marginLeft:0,alignItems: 'center'} }>
              <Avatar style={{ marginLeft:3}} img={container.props.giftUser_picture} rkType='circle'/>
                <Text style={{color: 'black',fontSize: 13,fontWeight: "bold",left:5, right:10}}>
                  {container.props.giftUser_nickname}
                </Text>

            </View>

                 
            <View style={{ flexDirection: 'row',marginRight:10,alignItems: 'center'}}>
              <Avatar style={{ marginLeft:0}} img={require('../../../assets/imgs/ImageA.png')} rkType='circle'/>
             
                <Text
                  style={{color: 'black',
                                fontSize: 13,
                                fontWeight: "bold",
                                left:5}}>
                  {container.props.giftProduct}
                </Text>

            </View>

            <View style={{ flexDirection: 'row',marginRight:10,alignItems: 'center'}}>
              <Avatar style={{ marginLeft:0}} img={require('../../../assets/imgs/ImageA.png')} rkType='circle'/>
              <Text
                style={{color: 'black',
                              fontSize: 13,
                              fontWeight: "bold",
                              left:5}}>
                    X
              </Text>
                              <Text
                  style={{color: 'black',
                                fontSize: 13,
                                fontWeight: "bold",
                                left:5}}>
                  {container.props.giftUserCount}
                </Text>
            </View>
          </View>

        </View>
          )
      }
}


let styles = RkStyleSheet.create(theme => ({
  viewerinfo: {
    flex: 0.65,
    width:180,
    marginRight:5,
    borderWidth:1,
    borderColor:'white',
    opacity: 0.6,
    borderRadius:30,
    backgroundColor: 'black',
  },
  rowViewers: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0)',
    fontSize: 14,
    marginBottom:2,
  },
  giftinfo: {
      flex: 0.35,
      width:180,
      borderWidth:1,
      marginRight:3,
      marginBottom:10,
      borderColor:'white',
      opacity: 0.6,
      borderRadius:20,
      backgroundColor: 'black',
    },
}));
