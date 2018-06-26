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

import { Actions } from 'react-native-router-flux';
import DefaultPreference from 'react-native-default-preference';
import Icon from 'react-native-vector-icons/Ionicons';
import {Avatar} from '../../components/avatar';
import GlobalDataManager from '../.././data/globaldatamanager.js';


let container;
class CloseView extends React.Component {

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
    return (
        <View style={styles.container}>
         <View style={styles.title}>
           <RkButton style={styles.close} rkType='clear'  onPress={() => Actions.Home()}>
               <Icon size={35} name='md-close' color="#fff" />
           </RkButton>
         </View>
         <View style={styles.content}>
           <View style={{alignItems: 'center'}}>
             <Text  style={{color:'white', fontSize:20}}> {GlobalDataManager.getstrings().live_title_close} </Text>
           </View>
           <View style={{marginVertical:60}}>
             <Avatar img={this.props.thumbnail} rkType='big'/>
           </View>
             <View style={styles.textRow}>
               <RkButton style={{marginVertical:10}}  onPress={() =>   Actions.Favorites()}>
                 <RkText  style={{color:'white', fontSize:20}}>{GlobalDataManager.getstrings().live_btn_favorite}</RkText>
               </RkButton>
             </View>
             <View style={styles.textRow}>
               <RkButton style={{marginVertical:10}}  onPress={() =>   Actions.Home()}>
                 <RkText  style={{color:'white', fontSize:20}}> {GlobalDataManager.getstrings().live_btn_back}</RkText>
               </RkButton>
             </View>
         </View>
       </View>

    );
  }
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,1)'
  },
  title: {
    marginTop:Platform.OS === 'ios'?20:5,
    height:80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  close: {
      position: 'absolute',
      top:5,
      right:10,

  },
  textRow: {
      flexDirection: 'row',
      justifyContent: 'center'
  },content: {
    justifyContent: 'space-between'
  },
}));

module.exports = CloseView;
