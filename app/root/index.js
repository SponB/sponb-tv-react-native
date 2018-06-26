'use strict';

import React, {
    Component
} from 'react'

import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    StatusBar,
    Dimensions,
    PixelRatio,
    PermissionsAndroid,
    Platform
} from 'react-native'

import {
    Scene,
    Router,
    Actions,
    Reducer,
    ActionConst,
    Tabs,
    Modal,
    Drawer,
    Stack,
    Lightbox,
} from "react-native-router-flux";

import Icon from 'react-native-vector-icons/Ionicons';
import {bootstrap} from '../config/bootstrap';
import {checkPermission} from 'react-native-android-permissions';
import * as Scenes from '../views'

bootstrap();

function onEnterHandler() {
    let currentRoute = Actions.currentRouter.currentRoute;
    console.log('onEnterHandler',currentRoute);
    store.dispatch(updateCurrentRoute(currentRoute));
}

export default class RootView extends Component{

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._permssioncheck();
    }

    _permssioncheck() {

        if (Platform.OS == 'android') {
            let toCheck = [
                "android.permission.INTERNET",
                "android.permission.ACCESS_NETWORK_STATE",
                "android.permission.ACCESS_WIFI_STATE",
                "android.permission.SYSTEM_ALERT_WINDOW",
                "android.permission.CAMERA",
                "android.permission.MODIFY_AUDIO_SETTINGS",
                "android.permission.RECORD_AUDIO",
                "android.permission.WAKE_LOCK",
                "android.permission.WRITE_EXTERNAL_STORAGE"
            ];

            let cb = (granted, perm) => console.log("Permission ", perm, granted)

            toCheck.map( e=> {
                checkPermission(e).then(result => cb('granted', e), error => cb('not granted', e))
            })

        }
    }

    originalrender() {
        return (
            <View style={styles.container}>
                <Router 
                    onPop={onEnterHandler}
                    onReplace={onEnterHandler}
                    onPush={onEnterHandler}
                >
                    <Scene key="root">
                        <Scene key="Login" component={Scenes.LoginView} hideNavBar  title="Login"  initial/>
                        <Scene key="ShowLive"  component={Scenes.ShowLive} hideNavBar type={ActionConst.RESET} />
                        <Scene key='Recoding' component={Scenes.BroadcastingView}  hideNavBar hideTabBar />
                        <Scene key='Home'   hideNavBar title={'Home'}  component={Scenes.HomeView} type={ActionConst.RESET}/>
                        <Scene key='BroadCast'   hideNavBar  title={'BroadCast'} component={Scenes.RecSettingView} type={ActionConst.RESET}/>
                        <Scene key='Favorites' hideNavBar title={'Favorites'} component={Scenes.FavoritesView} type={ActionConst.RESET}/>
                        <Scene key='Heart' hideNavBar title={'Heart'} component={Scenes.FavoritesView} type={ActionConst.RESET}/>
                        <Scene key='Notification' hideNavBar title={'Notification'} component={Scenes.FavoritesView} type={ActionConst.RESET}/>
                    </Scene>
                </Router>
            </View>
            )
    }

    render = () => <View><Text>abc</Text></View>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'rgba(1,1,1,1)'
    },
    tabIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBarStyle: {
        borderTopColor: 'darkgrey',
        borderTopWidth: 1 / PixelRatio.get(),
        backgroundColor: 'ghostwhite',
        opacity: 0.98
    },
    tabBarSelectedItemStyle: {
        backgroundColor: "#ddd",
    },indicatorStyle:{
        backgroundColor:'#de1d3e'
    },
})
