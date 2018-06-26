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
import ActionSheet from 'react-native-actionsheet'
import GlobalDataManager from '../../.././data/globaldatamanager.js';

const CANCEL_INDEX = 0
const DESTRUCTIVE_INDEX = 4

let container;
export class UserInfoView extends React.Component {

  constructor(props) {
    super(props);
    container = this;
    this.state = {
      options:[ 'Cancel', GlobalDataManager.getstrings().chat_title_report1,
                         GlobalDataManager.getstrings().chat_title_report2 ,
                        GlobalDataManager.getstrings().chat_title_report3 ,
                       GlobalDataManager.getstrings().chat_title_report4 ],
      title:'',
    };
    this.showActionSheet = this._showActionSheet.bind(this);

  }

  componentDidMount() {
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  _showActionSheet() {

    if(container.props.isBroad == true)//방장
    {
      container.setState({title:GlobalDataManager.getstrings().chat_title_user_report});

    }else {

      if(container.props.isPromote) //매니져권한
      {
        container.setState({title:GlobalDataManager.getstrings().chat_title_user_report});

      }else {
        container.setState({title:GlobalDataManager.getstrings().chat_title_room_report});
      }
    }
    this.ActionSheet.show()
  }

  _onPressKick()
  {
    container.props.onPressKick()
  }

  _onPressAppoint()
  {
    container.props.onPressAppoint()
  }

  _onPressReport(i)
  {
    if(i == 0)
      return;
    var content = container.state.options[i];

    if(container.props.isBroad == true)//방장
    {
      container.props.onPressReportUser(content);
    }else {

      if(container.props.isPromote) //매니져권한
      {
        container.props.onPressReportUser(content);

      }else {

        container.props.onPressReport(content);

      }
    }
  }

  _onPressBlockList()
  {
    this.showActionSheet();
  }

   _onPressClose()
   {
     container.props.onPressCloseUserInfo();
   }

  _viewBlockButton()
  {
    if(container.props.isBroad == true)
    {
        return(
                <View style={{flex:1 , marginTop:20,flexDirection: 'row', justifyContent: 'space-between',}}>
                  <RkButton style={{ height:30, marginLeft:20,marginBottom:5,alignItems: 'center'}}  onPress={() => this._onPressKick()}>
                    <RkText  style={{color:'white', fontSize:20}}> {GlobalDataManager.getstrings().chat_btn_user_kick}</RkText>
                  </RkButton>
                  <RkButton style={{ height:30, marginRight:20,marginBottom:5,alignItems: 'center'}}  onPress={() => this._onPressAppoint()}>
                    <RkText  style={{color:'white', fontSize:20}}> {GlobalDataManager.getstrings().chat_btn_promote}</RkText>
                  </RkButton>
                </View>
            )

    }else {

      if(container.props.isPromote)
      {
        return(
              <View style={{flex:1 , marginTop:20,flexDirection: 'row', justifyContent: 'space-between',}}>
                <RkButton style={{ height:30, marginLeft:20,marginBottom:5,alignItems: 'center'}}  onPress={() => this._onPressKick()}>
                  <RkText  style={{color:'white', fontSize:20}}> {GlobalDataManager.getstrings().chat_btn_user_kick} </RkText>
                </RkButton>
              </View>
              )
      }
    }
  }

  render() {
      return(
          <View style={styles.containerlist}>
            <TouchableWithoutFeedback onPress={()=> {this._onPressClose()}}>
              <View style={styles.containerlist}>
                <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, backgroundColor: 'white'}}>
                  {container.props.isOnlyView?null:(
                  <RkButton style={styles.report}  onPress={() =>  this._onPressBlockList()}>
                   <Icon size={20} name='md-bulb' color="#fff" />
                   <Text style={{color: 'black',
                                 fontSize: 13,
                                 fontWeight: "bold",
                                 left:2}}>{GlobalDataManager.getstrings().chat_btn_report}</Text>
                  </RkButton>
                  )}
                  <View style={{marginLeft:5,marginTop:10,marginBottom:0,flexDirection: 'column'}}>
                    <Avatar img={this.props.selectedUser.picture} rkType='bigRect'/>
                      <View style={{flex:1, marginTop:5,alignItems: 'center'}}>
                        <Text  style={{color:'black', fontSize:15,marginLeft:5}}>{this.props.selectedUser?this.props.selectedUser.user_id:''} </Text>
                      </View>
                      {container.props.isOnlyView?null:container._viewBlockButton()}
                  </View>
                </View>
              </View>
             </TouchableWithoutFeedback>
               <ActionSheet
                ref={o => this.ActionSheet = o}
                title={this.state.title}
                options={this.state.options}
                cancelButtonIndex={CANCEL_INDEX}
                destructiveButtonIndex={DESTRUCTIVE_INDEX}
                onPress={this._onPressReport}
              />
            </View>
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
