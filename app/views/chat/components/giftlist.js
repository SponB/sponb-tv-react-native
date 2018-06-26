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
  Alert
} from 'react-native';

import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';

import ModalDropdown from 'react-native-modal-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {Avatar} from '../../../components/avatar';
import GridView from 'react-native-super-grid';
import GlobalDataManager from '../../.././data/globaldatamanager.js';
import InAppBilling from 'react-native-billing';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules


if(Platform.OS ==='android')
{
  const getLicenseKey = () =>{
    return 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiH7LFGl/xRNlEWNcqfN624HsKFiDIZobUxeApgo5AbwBdvSMJW/HEwCTEr6bF44XuI8rvNxsX56KjKUCTyO0KrZ6Oy9hhfl0ZQSP/aWIKXsXYiYy4W6IuVeyaJs4Q9NqNesvWizSPfWST5h9vat03FrCdpUywDlHbr3q3B01Yg02gjF5MexoLf1wlDYcts3k0+a+0cBdXYQf9gI81LfXs8/AVD0GS7QdtYNs2UoUuKYf/KB+fYebyI4Y384OcEblcnjgWFwpAS4NAFsWCo3c5Q9+A4b042KMJ5pSwZu6lHT7JWiOPfq3KHJvmOWvNbxPRmtG9RPcAz598QJyhHsR+QIDAQAB';
  }
  new InAppBilling(getLicenseKey());

}

async function inapp(productId)
{

      await InAppBilling.close();
      try {
        await InAppBilling.open();
        if (!await InAppBilling.isPurchased(productId)) {
          const details = await InAppBilling.purchase(productId);
          console.log('You purchased: ', details);
        }
        const transactionStatus = await InAppBilling.getPurchaseTransactionDetails(productId);
        console.log('Transaction Status', transactionStatus);
        const productDetails = await InAppBilling.getProductDetails(productId);
        console.log(productDetails);
      } catch (err) {
        console.log(err);
      } finally {
        await InAppBilling.consumePurchase(productId);
        await InAppBilling.close();
      }

}

let container;
export class GiftListView extends React.Component {



  constructor(props) {
    super(props);
    container = this;
    this.state = {
      itemPaylist:[
                  {id:'com.sponb.coins.109', price:'109',coins:'69',},
                  {id:'com.sponb.coins.549', price:'549',coins:'349',},
                  {id:'com.sponb.coins.1099', price:'1099',coins:'699',},
                  {id:'com.sponb.coins.5499', price:'5499',coins:'3499',},
                  {id:'com.sponb.coins.10999', price:'10999',coins:'6999',},
      ],
      isVisiblePayitem:false,
      count:1,
     };
  }
  componentDidMount() {
  }
  componentWillMount() {
  }
  componentWillUnmount() {
  }

  _onPressPayitem()
  {
    console.log('_onPressPayitem');

      container.setState({
        isVisiblePayitem: true,
        gift_id:'',
        pay_id:'',

      });
  }

  _onPressPayClose()
  {
    container.setState({
      isVisiblePayitem: false,
    });
  }

  _onHandlePayItemPress(item, index){
    console.log('_onHandlePayItemPress',item,index);
    container.setState({
      pay_id: __DEV__?'android.test.purchased':item.id,
    });

    if(Platform.OS ==='android')
    {
      InAppBilling.open().
      then(() => InAppBilling.purchase(container.state.pay_id))
      .then((details) => {
        console.log('InAppBilling' , details)
        var body = new FormData();
        body.append('productId', details.productId);
        body.append('orderId',details.orderId);
        body.append('purchaseToken', details.purchaseToken);
        body.append('purchaseTime', details.purchaseTime);
        body.append('purchaseState', details.purchaseState);
        body.append('receiptSignature', details.receiptSignature);
        body.append('receiptData', details.receiptData);
        body.append('developerPayload', details.developerPayload);

        console.log('body',body);

        var request = {
            method: 'POST',
            headers: {
               'Accept': 'application/json',
               'Content-Type': 'multipart/form-data',
               'X-WDTV-TOKEN':GlobalDataManager.token
             },
            body: body
        };

        fetch('https://tv.sponb.io/api/v1/purchase/google', request)
            .then(response => {
                console.log('response' , response);
               return response.json();})
            .then(responseData => {
             console.log('google purchase' , responseData);
             return responseData;

            })
            .then(data => {
                console.log('data' , data);
                if(data)
                {
                  Alert.alert(
                        '',
                        '결제성공',
                        [
                          {text: 'OK', onPress: () => container._onPressPayClose()},
                        ]
                      )
                }
            })
            .catch(err => {
                console.log("google purchase fetch error" + err);
            });


        return InAppBilling.getProductDetails(container.state.pay_id);
      })
      .then((productDetails) => {
        console.log('productDetails' , productDetails)
        return InAppBilling.close();

      })
      .catch((error) => {
        this.setState({
          error: error
        });
      });

    }else {
      var productIdentifier = 'com.xyz.abc';
      InAppUtils.purchaseProduct(productIdentifier, (error, response) => {
         // NOTE for v3.0: User can cancel the payment which will be available as error object here.
         if(response && response.productIdentifier) {
            Alert.alert('Purchase Successful', 'Your Transaction ID is ' + response.transactionIdentifier);
            //unlock store here.
         }
      });
    }

  }

  _onHandleGiftItemPress(item, index){
    console.log('onHandleItemPress',item,index);
    container.setState({
      gift_id: item.id,
      name: item.name
    });

    container.props.onSelectGiftItem(item.id);

  }

  // _viewGridGift()
  // {
  //     return (
  //       <Swiper style={styles.wrapper} showsButtons={true}>
  //           {
  //
  //
  //             <View style={styles.slide1}>
  //               <Grid>
  //                 <Row  style={{backgroundColor:'yellow'}}>
  //               {
  //             this.state.itemGiftlist.map((item, i) => {
  //                       return (
  //                           <Col style={{backgroundColor:'red'}} key={i}><Text>Fixed width</Text></Col>
  //                       );
  //                   })
  //                 }
  //                 </Row>
  //                 <Row  style={{backgroundColor:'gray'}}>
  //                 </Row>
  //               </Grid>
  //             </View>
  //           }
  //     </Swiper>
  //     );
  // }


  _renderGiftItem(item,index) {
      return (
              <TouchableHighlight key={index} onPress= {this._onHandleGiftItemPress.bind(this, item , index)}>
              <View style={[styles.itemContainer,{backgroundColor:container.state.gift_id!=item.id?'#EAEAEA':'#22741C'}]}>
                
                <Text style={{flex:1 , marginTop: 10,  color: '#FFBB00'}}> {item.name} </Text>
                <SimpleLineIcons name="diamond" size={20} color="#FFFFFF"  style={{ flex:1}}/>
                  <Text style={{flex:1 ,   color: '#FFBB00'}}> ${item.coins} </Text>
              </View>
              </TouchableHighlight>
            );
  }


  _dropdown_show() {
      this._dropdown && this._dropdown.show();
    }

  _dropdown_select(idx) {
    this._dropdown && this._dropdown.select(idx);
  }

  _dropdown_willShow() {
    return false;
  }

  _dropdown_willHide() {
    let idx = this._dropdown_idx;
    this._dropdown_idx = undefined;
    return idx == 0;
  }

  _dropdown_onSelect(idx, value) {
    this._dropdown_idx = idx;
    // if (this._dropdown_idx != 0) {
    //   return false;
    // }
    container.setState({
      count: value,
    });


    container.props.dropdown_onSelect(value);
    this._dropdown.hide();
  }

  _renderPayItem(item,index) {
      return (
              <TouchableHighlight key={index} onPress= {this._onHandlePayItemPress.bind(this, item , index)}>
              <View style={[styles.itemContainer,{backgroundColor:container.state.pay_id!=item.id?'#EAEAEA':'#22741C'}]}>
              
                  <Text style={{flex:1 ,marginTop:10, color: '#FFBB00'}}> {item.coins} </Text>
                  <SimpleLineIcons name="diamond" size={20} color="#FFFFFF"  style={{ flex:1}}/>
                  <Text style={{flex:1 ,   color: '#FFBB00'}}> ${item.price} </Text>

              </View>
              </TouchableHighlight>
            );
  }


  _onPressSendGift()
  {
    container.props.onPressSendGift(container.state.gift_id,container.state.name,container.state.count);
    console.log('_onPressSendGift',container.state.gift_id, container.state.name,container.state.count);
  }

  _viewPayItem()
  {
    if(this.state.isVisiblePayitem==false)
    {
      return (
              <View style={{position: 'absolute', left: 0,right: 0, bottom: 0, height: 200,  backgroundColor: 'rgba(255,255,255,0.7)'}}>
                  <GridView
                   itemWidth={110}
                   items={this.props.itemGiftlist}
                   style={styles.gridView}
                   enableEmptySections={true}
                   renderItem={this._renderGiftItem.bind(this)}
                  />
                  <View style={{  flex: 0.25,
                  borderWidth:1,
                  marginRight:3,
                  borderColor:'white',
                  backgroundColor: 'gray',
                  flexDirection: 'row',
                  }}>
                  <View style={{flex:0.5 ,flexDirection: 'row',padding:0, alignItems: 'center' ,borderWidth:1,borderColor:'white',
                  backgroundColor: 'gray',}}>
                    <TouchableOpacity style={{flex:1 ,flexDirection: 'row',}} onPress={()=> {this._onPressPayitem()}}>
                      <SimpleLineIcons name="diamond" size={13} color="#FFFFFF"  style={{ marginLeft:10,marginRight:1}}/>
                      <Text style={styles.rowViewers}> {GlobalDataManager.conis}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flex:0.2 ,flexDirection: 'row',padding:0, alignItems: 'center',borderWidth:1,borderColor:'white',
                              backgroundColor: 'gray'}}>
                        <TouchableOpacity style={{flex:1 ,flexDirection: 'row'}} onPress={this._dropdown_show.bind(this)}>
                          <Icon name="md-arrow-dropdown" size={18} color="#FFFFFF"  style={{ marginLeft:7,marginRight:5, alignItems: 'center'}}/>
                          <ModalDropdown ref={el => this._dropdown = el}
                            textStyle={{color:'white'}}
                            style={styles.dropdown}
                            options={['1', `10`, '100']}
                            defaultValue='1'
                            onDropdownWillShow={this._dropdown_willShow.bind(this)}
                            onDropdownWillHide={this._dropdown_willHide.bind(this)}
                            onSelect={this._dropdown_onSelect.bind(this)}
                          />
                  </TouchableOpacity>
                  </View>
                    <View style={{flex:0.3 ,flexDirection: 'row',padding:0, alignItems: 'center'}}>
                      <RkButton style={{marginVertical:0}}  onPress={() =>   this._onPressSendGift()}>
                        <RkText  style={{color:'white', fontSize:13}}> {GlobalDataManager.getstrings().chat_btn_gift_send} </RkText>
                      </RkButton>
                    </View>
                  </View>
              </View>
      )

    }else {

      return (
            <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, backgroundColor: 'rgba(255,255,255,1)'}}>
              <View style={{height:40, marginTop:0,alignItems: 'center',backgroundColor:'rgba(0,0,0,0.5)'}}>
                <Text  style={{color:'white', fontSize:15 , marginTop: 10}}>{GlobalDataManager.getstrings().chat_title_pay}</Text>
              </View>
              <RkButton style={styles.back}  onPress={() =>  this._onPressPayClose()}>
               <Icon size={35} name='md-arrow-round-back' color="#fff" />
              </RkButton>

              <GridView
                itemWidth={110}
                items={this.state.itemPaylist}
                style={styles.gridView}
                enableEmptySections={true}
                renderItem={this._renderPayItem.bind(this)}
              />

                <View style={{height:25 ,flexDirection: 'row',padding:0, backgroundColor:'rgba(0,0,0,0.5)'}}>
                    <SimpleLineIcons name="diamond" size={14} color="#FFFFFF"  style={{marginTop:4, marginLeft:3,marginRight:1}}/>
                  <Text
                    style={{color:'white', marginTop:3, marginLeft:5}}>
                    {GlobalDataManager.user_cash}
                  </Text>
                </View>
            </View>
       );
    }
  }


  render() {
    return (
         <View style={styles.containerlistIos}>
           <TouchableWithoutFeedback onPress={()=> {
               container.props.onPressCloseGiftList();}}>
             <View style={{position: 'absolute', left: 0,right: 0, bottom: 200,top:0, backgroundColor: 'rgba(0,0,0,0)',}}/>
           </TouchableWithoutFeedback>
           {this._viewPayItem()}
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
  containerlistIos: {
    flex: 1,
    backgroundColor: 'rgba(255,0,0,0)'
  },
  dropdown: {
    margin: 1,
  },gridView: {
    paddingTop: 5,
    flex: 1,
    backgroundColor:'rgba(0,0,0,0)'
  },itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 5,
    height: 100,
    width: 100
  },  back: {
        position: 'absolute',
        top:5,
        left:5,
        width:30,
        height:30,
    }
}));
