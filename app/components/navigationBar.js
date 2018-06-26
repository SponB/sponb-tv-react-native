import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

export default class NavigationBar extends React.Component {


  render() {
    return (
      <View style={styles.container}>
       <View style={{flex:1, flexDirection: 'row'}}>
       <View style={{flex:1 ,marginLeft:20, justifyContent: 'center'}}>
       <Icon style={{color: 'white'}} name='ios-search' size={ Platform.OS === 'ios'?40:40} />
       </View>
       <View style={{flex:1 , alignItems: 'center', justifyContent: 'center'}}>
       <Text style={styles.naviTitle}>
          SponB TV
        </Text>
       </View>
       <View style={{flex:1,alignItems: 'flex-end',marginRight:20, justifyContent: 'center'}}>
        <Icon style={{color: 'white'}} name='ios-cart' size={ Platform.OS === 'ios'?40:40} />
       </View>
       </View>
        
       

        


       

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center', 
    backgroundColor: '#FF5E00'
  },
 naviTitle:{
  color: 'white',
  fontSize: 25,
  

 },
 naviIcon: {
  flex: 2,
  flexDirection: 'column'
 },
 rightTop:{
  flex: 1,
  backgroundColor: 'blue'
 },
 rightBottom:{
  flex: 2,
  backgroundColor: 'yellow'
 }
});
