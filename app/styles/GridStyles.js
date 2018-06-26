import React from 'react-native'
import {
  Dimensions
} from 'react-native'

module.exports = React.StyleSheet.create({
  rowContainer: {
    overflow: 'hidden',
    width: Dimensions.get('window').width / 2.1,
    height: Dimensions.get('window').width / 2 ,
    borderWidth: 0,
    padding:4,
  },
  rowContent: {
    flex: 1,
    borderRadius:3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  rowTitle: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,1)',
    fontSize: 12,
    fontWeight: "bold",
    position: 'absolute',
    bottom: 2,
    left:2
  },
  rowUserId: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,1)',
    fontWeight: "bold",
    fontSize: 13,
    position: 'absolute',
    bottom: 20,
    left:2
  },
  rowViewers: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0)',
    fontSize: 10,
    position: 'absolute',
    right:4
  },
  overlayViewers: {
    flex: 1,
    position: 'absolute',
    left: 3,
    top: 3,
    width: 50,
    height: 18,
    borderWidth:1,
    borderColor:'white',
    opacity: 0.6,
    borderRadius:5,
    backgroundColor: 'black',
  },

})
