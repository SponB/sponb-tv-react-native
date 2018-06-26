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
import { Actions } from 'react-native-router-flux';

let container;
export class BroadUserListView extends React.Component {

  constructor(props) {
    super(props);
    container = this;
    this.state = {
      selectedUser:'',
    };

  }

  componentDidMount() {
  }

  _onPressUserRow(rowID, rowData)
  {
     console.log('_onPressUserRow',rowID);
    container.setState({
      selectedUser:rowID
    });
    container.props.onPressUserRow(rowID);
  }


  _renderUserInfoRow(row) {
    console.log('_renderRow',row.content);
    return (
            <TouchableHighlight onPress={this._onPressUserRow.bind(this.rowID, row)}>
                <View style={{
                    flex: 1,
                    height:40,
                    marginBottom: 1,
                    borderBottomWidth: 1,
                    borderBottomColor:'rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255,255,255,0)'
                  }}>
                  <View style={{flex:1 , marginLeft:5, flexDirection: 'row',padding:0, alignItems: 'center',}}>
                    <Avatar img={row.picture} rkType='small'/>
                    <Text style={{color: 'black',
                                  fontSize: 13,
                                  fontWeight: "bold",
                                  marginLeft:5,
                                  left:2}}>{row.nickname}</Text>
                  </View>
               </View>
            </TouchableHighlight>
    )
  }


  render() {
      return(
        <TouchableWithoutFeedback onPress={()=> {container.props.onPressCloseBroadUserList();}}>
          <View style={styles.containerlist}>
            <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 200,  zIndex:1,backgroundColor: 'white'}}>
              <View style={{top:0, left: 0, right: 0, height: 20, backgroundColor: 'white'}}>
                <Text style={{color: 'black',
                              fontSize: 13,
                              fontWeight: "bold",
                              left:2}}>users:{this.props.dataSourceUser.getRowCount()}</Text>
              </View>
              <ListView
                 dataSource={this.props.dataSourceUser}
                 enableEmptySections={true}
                 renderRow={this._renderUserInfoRow.bind(this)}
               />
            </View>
          </View>
         </TouchableWithoutFeedback>
      )
      }
}


let styles = RkStyleSheet.create(theme => ({
  containerlist: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    top:0,
    right:0,
    backgroundColor: 'rgba(0,0,0,0)'
  },
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
  report:
  {
    position: 'absolute',
    top:5,
    left:10,
    width:70,
    height:50,
    zIndex:2,
  },  back: {
        position: 'absolute',
        top:5,
        left:5,
        width:30,
        height:30,
    },
}));
