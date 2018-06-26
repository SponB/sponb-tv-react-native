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
  Image,
  Dimensions,
  Platform,
} from 'react-native'

import { Actions } from 'react-native-router-flux';
import EasyListView from 'react-native-easy-listview-gridview'
import WatchTVView from '../showlive'
import GridStyles from '../.././styles/GridStyles.js'
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageLoad from 'react-native-image-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import DefaultPreference from 'react-native-default-preference';
import GlobalDataManager from '../.././data/globaldatamanager.js';
import TabBarView from '../.././components/tabbar.js'
import NavigationBar from '../.././components/navigationBar.js'


var {height, width} = Dimensions.get('window');


export class HomeView extends Component {

    constructor(props) {
        super(props)
        this.state = {
           visible: true,
           listdata:[],
           layout:{
            height:height,
            width:width,
           },

         };
         this.renderGridItem = this._renderGridItem.bind(this)
         this.onFetch = this._onFetch.bind(this)

    }

    componentDidMount () {
        this.refreshInterval = setInterval(
          () => { this._onFetch(1,()=>{}, ()=>{}) },
          15 *1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.refreshInterval);
    }

    render() {
      return (

         

        <View style={{flex:10 , flexDirection: 'column',  backgroundColor:'rgba(0,0,0,0)'}}>

          <NavigationBar />  

          <View style={{flex:2, backgroundColor: 'blue'}} />
      
          <View style={{flex:6, backgroundColor: 'rgba(0,0,0,0)', padding: 10}}>
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

           <TabBarView isHome={true}/>
         
          
      </View>

  

      


        
      )
    }

    _renderGridItem(index, rowData, sectionID, rowID, highlightRow) {
      return (
        <View
            key={index}
            style={GridStyles.rowContainer}>
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']} style={styles.linearGradient}>
            <TouchableHighlight
              style={{flex:1}}
              onPress={() => this._gotoView(rowData)}>
              <View style={GridStyles.rowContent}>
                <ImageLoad
                    isShowActivity={false}
                    style={styles.backgroundImage}
                    source={{ uri:  rowData.broadcast.thumbnail }}
                />
                <View style={GridStyles.overlayViewers}>
                  <Icon name="ios-eye-outline" size={14} color="rgba(255,255,255,1)"  style={{backgroundColor:'rgba(0,0,0,0)' , marginLeft:3}}/>
                  <Text style={GridStyles.rowViewers}>
                    {rowData.broadcast.stats.viewers}
                  </Text>
                </View>
                <Text style={GridStyles.rowUserId}>
                  {rowData.user.user_id}
                </Text>
                <Text style={GridStyles.rowTitle}>
                  {rowData.broadcast.title}
                </Text>
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

            fetch('https://tv.sponb.io/api/v1/broadcast/list', request)
                .then(response => {
          //          console.log('response' , response);
                   return response.json();})
                .then(responseData => {
          ///        console.log('broadcast' , responseData.list);
                 return responseData;

                })
                .then(data => {
                    console.log('home data' , data);
                    //dummy data (delete)
                    data.list = [...data.list, ...data.list, ...data.list,...data.list]
                    this.setState({
                      listdata: data.list,
                      visible: false
                    });

                    
                   success(this.state.listdata)

                })
                .catch(err => {
                   success([])
                   failure('load fail...', null)
                   this.setState({
                     listdata: [],
                     visible: false
                   });

                   console.log("extLogin fetch error" + err);
                });

    }
    _gotoView(rowData) {
        Actions.ShowLive({broadcastdata:rowData});
     }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  toolbar: {
    flex: 1,
    backgroundColor: '#FF5E00'
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
    borderRadius: 5,
  }
});
