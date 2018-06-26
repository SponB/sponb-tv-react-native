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

let container;
export class GiftinfoView extends React.Component {
  static propTypes = {
   count_hits: React.PropTypes.number.isRequired,
   count_likes: React.PropTypes.number.isRequired,

  }

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
      <View style={{flex:0.38 ,flexDirection: 'row',marginLeft:5, marginBottom:5, backgroundColor:'rgba(0,0,0,0)'}}>
          <View style={styles.giftinfo}>
            <View style={{flex:1 ,flexDirection: 'row',padding:0}}>
              <SimpleLineIcons name="diamond" size={12} color="#FFFFFF"  style={{marginTop:3,marginLeft:10,marginRight:5}}/>
              <Text style={styles.rowViewers}>
                {container.props.count_hits}
              </Text>
            </View>
          </View>
          <View style={styles.giftinfo}>
            <View style={{flex:1 ,flexDirection: 'row',padding:0}}>
              <Icon name="md-heart" size={18} color="#FFFFFF"  style={{ marginLeft:7,marginRight:5}}/>
              <Text
                style={styles.rowViewers}>
                {container.props.count_likes}
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
