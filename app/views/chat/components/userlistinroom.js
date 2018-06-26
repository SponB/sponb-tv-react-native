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
  Dimensions,
  FlatList
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
export class UserListInRoomView extends React.Component {

  static propTypes = {
    host_id: React.PropTypes.string,
    viewers: React.PropTypes.number.isRequired,
    onPressUserList:React.PropTypes.func.isRequired,
    onPressUser:React.PropTypes.func.isRequired,
   }

  constructor(props) {
    super(props);
    container = this;
    this.state = {
      refreshing:false,

     };

     this.onEndReached = this._onEndReached.bind(this);
     this.onRefresh = this._onRefresh.bind(this);

  }

  componentDidMount() {
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  _onEndReached()
  {

  }
  _onRefresh()
  {

  }

  _onPressUserList()
  {

    container.props.onPressUserList();
  }

  _onPressUser()
  {

    container.props.onPressUser();
  }

  render() {
    return(
      <View style={{flex:0.62 ,flexDirection: 'row',marginLeft:5, marginBottom:5, backgroundColor:'rgba(0,0,0,0)'}}>
        <View style={styles.viewerinfo}>
          <TouchableWithoutFeedback onPress={()=> this._onPressUser()}>
          <View style={{flex:1 ,flexDirection: 'row', marginBottom:5,}}>
            <Avatar style={{marginTop:5, marginLeft:3,marginRight:20}} img={this.props.host_picture} rkType='circle'/>
            <View style={{flex:1 ,flexDirection: 'column', marginTop:5,}}>
              <Text style={styles.rowViewers}>
                {this.props.host_id}
              </Text>
            <View style={{flex:1 ,flexDirection: 'row'}}>
              <Icon name="ios-eye-outline" size={18} color="#FFFFFF"  style={{ marginLeft:0,marginRight:5}}/>
              <Text
                style={styles.rowViewers}>
                {this.props.viewers}
              </Text>
            </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        </View>
          <FlatList
            horizontal={true}
            data={this.props.userdata}
            keyExtractor={(item, index) => index}
            initialNumToRender={100}
            onEndReached={this.onEndReached}
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
            renderItem={({ item }) => {
              return (
                <TouchableWithoutFeedback onPress={()=> this._onPressUserList()}>
                  <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
                    <Avatar style={{marginRight:2}} key={item.user_id} img={{uri:item.picture}} rkType='circle'/>
                  </View>
                </TouchableWithoutFeedback>
              );
            }}
          />
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
  }
}));
