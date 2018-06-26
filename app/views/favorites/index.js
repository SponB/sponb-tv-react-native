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
  Dimensions,
  AppState,
  Platform,
  Image
} from 'react-native'

import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';

import EasyListView from 'react-native-easy-listview-gridview'
import WatchTVView from '../showlive'
import GridStyles from '../.././styles/GridStyles.js'
import { Actions } from 'react-native-router-flux';
import DefaultPreference from 'react-native-default-preference';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageLoad from 'react-native-image-placeholder';
import GlobalDataManager from '../.././data/globaldatamanager.js';
import Toast from 'react-native-root-toast';
import TabBarView from '../.././components/tabbar.js'

var {height, width} = Dimensions.get('window');

let container;
export  class FavoritesView extends Component {

    constructor(props) {

        super(props)
        container = this;
        this.state = {
           visible: true,
           listdata:[],
           layout:{
             height:height,
             width:width,
            },
         };


       this.renderGridItem = this._renderGridItem.bind(this);
       this.onFetch = this._onFetch.bind(this);
    }

    componentDidMount () {
      AppState.removeEventListener('change', this._handleAppStateChange);

    }

    componentWillUnmount() {
      AppState.addEventListener('change', this._handleAppStateChange);
      console.log('componentWillMount', this.state.category);
    }


    _handleAppStateChange(currentAppState) {
      console.log('FavoritesView currentAppState',currentAppState);
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

      render() {
        return (
          <View style={{flex:10 ,marginTop:Platform.OS === 'ios'?20:0, flexDirection: 'column',  backgroundColor:'rgba(0,0,0,0)'}}>
            <View style={{flex:9, backgroundColor: 'rgba(0,0,0,0)'}}>
              <EasyListView
                emptyContent={"No Data"}
                timeout={10000}
                loadingTintColor={"#9b9b9b"}
                ref={component => this.listview = component}
                renderItem={this.renderGridItem}
                column={2}
                refreshHandler={this.onFetch}
                loadMoreHandler={this.onFetch}
            // other props
              />
            </View>
            <TabBarView isHome={false} isFavorite={true}/>
        </View>
        )
      }


      _renderGridItem(index, rowData, sectionID, rowID, highlightRow) {
        return (
          <View  key={index} style={GridStyles.rowContainer}>
              <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']} style={styles.linearGradient}>
              <TouchableHighlight style={{flex:1}}onPress={() => this._gotoView(rowData)}>
                <View
                  style={GridStyles.rowContent}>
                  <ImageLoad
                      isShowActivity={false}
                      style={styles.backgroundImage}
                      source={{ uri:  rowData.broadcast.thumbnail }}
                  />
                  <View style={GridStyles.overlayViewers}>
                    <Icon name="ios-eye-outline" size={14} color="rgba(255,255,255,1)"  style={{backgroundColor:'rgba(0,0,0,0)' , marginLeft:3}}/>
                    <Text
                      style={GridStyles.rowViewers}>
                      {rowData.broadcast.stats.viewers}
                    </Text>
                  </View>
                  <Text
                    style={GridStyles.rowUserId}>
                    {rowData.user.user_id}
                  </Text>
                  <Text
                    style={GridStyles.rowTitle}>
                    {rowData.broadcast.title}
                  </Text>
                  <TouchableHighlight style={{position: 'absolute',bottom:2, right:2 , width:30 , height:40 ,alignItems: 'center',justifyContent: 'center', backgroundColor:'rgba(0,0,0,0.5)'}} onPress={() => this._unfollow(rowData.user.user_id,rowData.broadcast.broadcast_id)}>
                    <Icon style={{color: 'white'}} name='ios-trash' size={ Platform.OS === 'ios'?30:30} />
                  </TouchableHighlight>
                </View>
              </TouchableHighlight>
            </LinearGradient>
            </View>
        )
      }

      _onFetch(pageNo, success, failure) {

              var request = {
                  method: 'GET',
                  headers: {
                     'Accept': 'application/json',
                     'Content-Type': 'application/x-www-form-urlencoded',
                     'X-WDTV-TOKEN':GlobalDataManager.token
                   }
              };
              var start = Number(pageNo)-1;
              var end = start +10;
              var url = 'https://tv.sponb.io/api/v1/broadcast/followed'+'/'+start+'/'+end;
              console.log('falvorite',url);

              fetch(url, request)
                  .then(response => {
                      console.log('followed response' , response);
                     return response.json();})
                  .then(responseData => {
            ///        console.log('broadcast' , responseData.list);
                   return responseData;

                  })
                  .then(data => {
                      console.log('followed data' , data);
                      container.setState({
                        listdata: data.list,
                        visible: false

                      });

                       success(container.state.listdata)
                       console.log('followed data' , container.state.listdata);

                  })


                  .catch(err => {
                     success([])
                     failure('followed load fail...', null)
                     container.setState({
                       listdata: [],
                       visible: false

                     });

                     console.log("extLogin fetch error" + err);
                  });


      }
      _gotoView(rowData) {
          Actions.ShowLive({broadcastdata:rowData});
       }

      _unfollow(user_id,room_id)
      {
        console.log('user_id,room_id',user_id,room_id);
        var request = {
            method: 'POST',
            headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/x-www-form-urlencoded',
               'X-WDTV-TOKEN':GlobalDataManager.token
             }
        };
        var api = 'unfollow';
        var url = 'https://tv.sponb.io/api/v1/broadcast/'+room_id+'/'+api;
        console.log('follow',url);
        container.setState({
          visible: true

        });
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
              container.setState({
                listdata: [],
                visible: false

              });
              container.listview.onRefresh();
            })
            .catch(err => {
                console.log("follow fetch error" + err);
            });
      }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,1)',
  },
  welcome: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
  },
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    backgroundColor: 'rgba(0,0,0,0)',
    borderRadius:3
  },
  linearGradient: {
    flex: 1,
    padding: 5,
    borderRadius: 5
  }
});
