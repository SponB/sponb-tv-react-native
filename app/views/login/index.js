'use strict';

import React, {
    Component
} from 'react'

import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    Alert,
    AppState,
    Platform,
    async,
    AsyncStorage
} from 'react-native'

import Storage from 'react-native-storage';
import { Actions } from 'react-native-router-flux';
import { Button ,SocialIcon} from 'react-native-elements'
import * as simpleAuthProviders from 'react-native-simple-auth';
import secrets from '../../data/secrets.js';
import DefaultPreference from 'react-native-default-preference';
import Dimensions from 'Dimensions';
import Spinner from 'react-native-loading-spinner-overlay';
import GlobalDataManager from '../.././data/globaldatamanager.js';

var {height, width} = Dimensions.get('window');
let container;


import {
    InAppUtils,
    InAppBillingBridgePackage
} from 'NativeModules'



export  class LoginView extends Component {

    constructor(props) {
        super(props)
        container = this;
        this.state = {
            loading: false,
            secrets:secrets,
            visible:false,
            appState: AppState.currentState
        };

        this.initStorage()
        this.checkAuthenticated()
    }

    initStorage(){
        this.storage = new Storage({
            // maximum capacity, default 1000
            size: 1000,

            // Use AsyncStorage for RN, or window.localStorage for web.
            // If not set, data would be lost after reload.
            storageBackend: AsyncStorage,

            // expire time, default 1 day(1000 * 3600 * 24 milliseconds).
            // can be null, which means never expire.
            defaultExpires: 1000 * 3600 * 24 * 365,

            // cache data in the memory. default is true.
            enableCache: true,

            // if data was not found in storage or expired,
            // the corresponding sync method will be invoked and return
            // the latest data.
            sync : {
                // we'll talk about the details later.
            }
        })
    }

    checkAuthenticated(){
        this.storage.load({
            key: 'socialAuth',

            // autoSync(default true) means if data not found or expired,
            // then invoke the corresponding sync method
            autoSync: true,

            // syncInBackground(default true) means if data expired,
            // return the outdated data first while invoke the sync method.
            // It can be set to false to always return data provided by sync method when expired.(Of course it's slower)
            syncInBackground: true,

            // you can pass extra params to sync method
            // see sync example below for example
            syncParams: {
                extraFetchOptions: {
                    // blahblah
                },
                someFlag: true,
            },
        }).then(data => {
            this._LoginAPI(data.provider,{
                user:data.user,
                credentials:data.credentials
            });
        }).catch(err => {
            //ignore
        })
    }

    saveAuthentication(provider,data){
        console.log('saveAuthentication',provider,data)
        this.storage.save({
            key: 'socialAuth',   // Note: Do not use underscore("_") in key!
            data: {
                provider: provider,
                user: data.user,
                credentials: data.credentials
            },
        });
    }

    componentDidMount () {



        DefaultPreference.get('token').then(function(value) {
            console.log('get',value);
            if (typeof value != 'undefined')
            {
                // 자동로그인 처리
                // if(value && value.length > 0)
                // {
                //   GlobalDataManager.token = value;
                //
                //   DefaultPreference.get('conis').then(function(value) {
                //     GlobalDataManager.conis = value;
                //   });
                //
                //
                //   Actions.Home();
                // }
            }
        });

        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active' && this.state.loading) {
            console.log('App has come to the foreground!')
            this.setState({
                loading: true,
                visible: false
            });
        }
        this.setState({appState: nextAppState});
    }



    getName(provider) {
        switch (provider) {
            case 'instagram':
            return this.props.info.data.full_name;
            case 'linkedin':
            return `${this.props.info.firstName} ${this.props.info.lastName}`;
            default:
            return this.props.info.name
        }
    }

    getPictureLink(provider) {
        switch (provider) {
            case 'google':
            return this.props.info.picture;
            case 'facebook':
            return `https://graph.facebook.com/${this.props.info.id}/picture?type=square`
            case 'twitter':
            return this.props.info.profile_image_url_https;
            case 'instagram':
            return this.props.info.data.profile_picture;
            case 'tumblr':
            return `https://api.tumblr.com/v2/blog/${this.props.info.name}.tumblr.com/avatar/96`;
            case 'linkedin':
            const profileUrl = `https://api.linkedin.com/v1/people/~:(picture-url)?oauth2_access_token=${this.props.info.token}&format=json`
            fetch(profileUrl)
            .then(response => response.json())
            .then(responseJson => {
                this.setState({ picture: responseJson.pictureUrl });
            });
            return '';
        }
    }


    _onLoginFail()
    {
        container.setState({
            loading: false,
            visible: false
        })
    }

    onBtnPressed(provider, opts) {
        // {Actions.Index()};
        // return;


        this.setState({
            loading: true,
            visible: true
        });


        simpleAuthProviders[provider](opts)
        .then((info) => {

            console.log('eAuth info' , info);
            if(info.user.error)
            {
                container.setState({
                    loading: false,
                    visible: false
                });
            }else {
                container.setState({
                    loading: false,
                    visible: true
                });

                this.saveAuthentication(provider,info)
                container._LoginAPI(provider,info);

            }


        })
        .catch((error) => {
            console.log('error' , error);
            container.setState({
                loading: false,
                visible: false
            });
            console.log('Authorize Error', error.message);
        });
    }

    _loginAction()
    {
        container.setState({
            visible: false
        });
        setTimeout(function () {
            {Actions.Home()}
        }, 500);
    }

    _LoginAPI(provider , info)
    {

        var body = new FormData();
        body.append('origin', provider);
        body.append('uid', info.user.id);
        body.append('data', JSON.stringify(info.user));

        console.log('body',body);
        var request = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            },
            body: body
        };

        this.setState({
            visible: true
        });

        try {
            fetch('https://tv.sponb.io/api/v1/extLogin', request)
            .then(response => {
                console.log('response' , response);
                return response.json();})
                .then(responseData => {
                    console.log('extLogin' , responseData);
                    return responseData;

                })
                .then(data => {
                    console.log('data' , data);

                    var user_id =data.user.user_id==null?'':data.user.user_id.toString();
                    var name= data.user.name==null?'':data.user.name.toString();
                    var nickname= data.user.nickname==null?'':data.user.nickname.toString();
                    var coins = data.user.coins==null?'':data.user.coins.toString();
                    var diamonds = data.user.diamonds==null?'':data.user.diamonds.toString();
                    var level = data.user.level==null?'':data.user.level.toString();
                    var picture = data.user.picture==null?'':data.user.picture.toString();

                    DefaultPreference.clear('token').then(function() {console.log('clear token')});
                    DefaultPreference.clear('user_id').then(function() {console.log('clear user_id')});
                    DefaultPreference.clear('nickname').then(function() {console.log('nickname')});

                    DefaultPreference.set('token', data.token).then(function() {
                        console.log('set token')
                        GlobalDataManager.token = data.token;
                    });
                    DefaultPreference.set('user_id', user_id).then(function() {
                        console.log('set user',user_id)
                        GlobalDataManager.user_id = user_id;
                    });
                    DefaultPreference.set('coins', coins).then(function() {
                        console.log('set coins',coins)
                        GlobalDataManager.coins =  coins;
                    });
                    DefaultPreference.set('diamonds', diamonds).then(function() {
                        console.log('set diamonds',diamonds)
                        GlobalDataManager.diamonds =  diamonds;
                    });
                    DefaultPreference.set('level',level).then(function() {
                        console.log('set level',level)
                        GlobalDataManager.level =  level;
                    });
                    DefaultPreference.set('name', name).then(function() {
                        console.log('set name',name)
                        GlobalDataManager.name =  name;
                    });
                    DefaultPreference.set('picture', picture).then(function() {
                        console.log('set picture',picture)
                        GlobalDataManager.picture =  picture;
                    });
                    DefaultPreference.set('nickname', nickname).then(function() {
                        console.log('set nickname',nickname)
                    });

                    if(data.user.user_id == null)
                    {
                        Alert.alert(
                            'Login Error',
                            'user_id is null' ,
                            [
                                {
                                    text: 'OK',
                                    onPress: () => this._onLoginFail()
                                },
                            ]
                        )

                        return;
                    }
                    container._loginAction();

                })

                .catch(err => {
                    console.log("extLogin fetch error" + err);
                });
            } catch (e) {
                console.log("extLogin fetch error" + err);
            } finally {

            }
        }
        render() {
            return (
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}>

                {Object.keys(this.state.secrets).map((provider, i) => {
                    return (
                        <SocialIcon style={styles.buttons}
                        key={provider}
                        title={provider}
                        button
                        onPress={this.onBtnPressed.bind(this, provider, this.state.secrets[provider])}
                        type={provider}
                        />
                    );
                })
            }
            <Spinner visible={this.state.visible} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    buttons: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10
    },
    google: {
        backgroundColor: '#ccc'
    },
    facebook: {
        backgroundColor: '#3b5998'
    },
    twitter: {
        backgroundColor: '#48BBEC'
    },
    instagram: {
        backgroundColor: '#3F729B'
    },
    tumblr: {
        backgroundColor: '#36465D'
    },
    linkedin: {
        backgroundColor: '#0077B5'
    }
});
