import React, { Component } from 'react';
import { View, Image, ListView, BackHandler,AsyncStorage } from 'react-native';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Spinner, List, ListItem,Badge
} from 'native-base';
import ImageLoad from 'react-native-image-placeholder';
import config from "../../src/config/app.js";
import styles from "../../style/app.js";
import storage from '../services/storage'
import api from '../services/api';
import {globals} from "../services/globals";
import UserChat from "./UserChat";
import IconBadge from 'react-native-icon-badge';
import { NavigationActions } from 'react-navigation' ;

export default class UserFriends extends Component {
    accessToken;

    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            screen: 1,
            dataLoaded: "Loading",
            friends: [],
            currentFriend: null,
            userChatRef: null,
            last_message:null,
            messageWritten:null,
            BadgeCount:1,
        }
    }
    
  async  componentWillMount(){
        const value = await AsyncStorage.getItem('accessToken');
        const accessTokennn = await AsyncStorage.getItem('accessToken');
        api.check_token(value,accessTokennn).then((response) => {
            console.log("response",response)
            if (response.message == "Unauthenticated.") {
                    this.props.navigation.dispatch(NavigationActions.reset(
                        {
                           index: 0,
                           actions: [
                             NavigationActions.navigate({ routeName: 'LogSignScreen'})
                           ]
                         }))
                          return true;
            }else{
                this.getMessagesMain();
                this.getFriendRequestCount();
                console.log(this.props.navigation.state)
               
            }
        })
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.dispatch(NavigationActions.reset(
                {
                   index: 0,
                   actions: [
                     NavigationActions.navigate({ routeName: 'MainAppScreen'})
                   ]
                 }))
                  return true;
          }); 
       
    }
    componentDidMount(){
        console.log("DONE CHAT")
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    getMessagesMain(){
        storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result
            if (this.state.friends = []){

            api.get_all_friends(result).then((response) => {
                response.data.forEach(element => {
                   this.state.friends.push(element.friend)
                });

                console.log(this.state.friends,"{{}}}")
                this.setState({ screen: 1, dataLoaded: "done" })
            })
        }
        })

        console.log(globals.mainSocket)
        // globals.mainSocket.on('chat_message', (data) => {
        //     if (this.state.screen == 1) {
        //         if (data.user_id == globals.user.id) {
        //             let friends = this.state.friends;
        //             let _friend = null;
        //             console.log("hoola")
        //             friends.forEach((friend, index) => {
        //                 console.log(friend)
        //                 if (friend.user.id == data.message.user._id) {
        //                     friend.last_message = data.message.text
        //                     friend.last_message_time = data.last_message_time
        //                     friend.last_message_date = data.last_message_date
        //                     friend.is_seen = false
        //                     _friend = friend;

        //                     friends.splice(index, 1)
        //                 }
        //             })

        //             this.setState({ friends: friends })
        //             if (_friend != null)
        //                 friends.push(_friend)
        //             this.setState({ friends: friends })
        //         }
        //     }
        //     else this.state.userChatRef.updateMessage(data)
        // })
        this.wordWrittenGenerator();
    }

    wordWrittenGenerator(){
            if(this.state.last_message == undefined){
                this.setState({messageWritten:"Start a conversation"})
                console.log(this.state.messageWritten)
            }
            else{
                this.setState ({messageWritten:this.state.last_message.substring(0, 30) + (this.state.last_message.length > 30 ? '...' : '')} )
                console.log(this.state.messageWritten);
            }
    }
     getFriendRequestCount(){
        storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result
        
            api.get_friend_requests_count(result).then((response) => {
                this.setState({BadgeCount:response})
            })
        })
    }
    deleteRow(secId, rowId, rowMap,data) {
        storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result
            console.log(accessToken)
            console.log(data.id)
            api.remove_friend(data.id,accessToken).then((response)=>{
                console.log(response)})
        })
        rowMap[`${secId}${rowId}`].props.closeRow();
        const newData = [...this.state.friends];
        newData.splice(rowId, 1);
        this.setState({ friends: newData });
      }

    renderBody() {
        if (this.state.screen == 1) {
            return(
                
                <Content style={{ width: config.screenWidth,height:config.screenHeight,flex:1 }}>
                    {
                        this.state.dataLoaded == "done" && this.state.friends != false ? 
                        <List style={{marginRight:"2%",marginLeft:"2%"}}
                            dataSource={this.ds.cloneWithRows(this.state.friends)}
                            renderRow={(friend, s1, index) =>
                                    <ListItem
                                        onPress={async () =>{await this.setState({ screen: 1, currentFriend: friend,last_message:friend.last_message });this.goToChat()}}
                                        style={{ backgroundColor: friend.is_seen ? 'transparent' : 'transparent' }}>
                                                <Left style={{ margin: "0%", flex: 1 }}>
                                                    {/* <Thumbnail source={{uri: friend.avatar}} /> */}
                                                    <ImageLoad
                                                        style={{ width: 50, height: 50 }}
                                                        loadingStyle={{ width: 50, height: 50 }}
                                                        placeholderStyle={{ width: 50, height: 50, resizeMode: Image.resizeMode.stretch, borderRadius: 50 }}
                                                        borderRadius={50}
                                                        source={{ uri: friend.avatar }}
                                                        placeholderSource={	require('../../assets/default_avatar.png') } />
                                                    {
                                                        friend.is_online ? (
                                                        <Icon name='ios-radio-button-on' style={{color:'green', position: 'absolute', bottom: 0, right: -8}} />
                                                        ) : (<Icon name='ios-radio-button-on' style={{color:'grey', position: 'absolute', bottom: 0, right: -8}} />)
                                                    }
                                                </Left>
                                                <Body style={{ marginLeft: "0%", width: 180, flex: 3 }}>
                                                    <Text style={{ fontWeight: friend.is_seen ? 'normal' : 'bold' }}>{friend.name}</Text>
                                                    <Text style={{ fontWeight: friend.is_seen ? 'normal' : 'bold' }} note> {this.state.messageWritten} </Text>
                                                </Body>
                                                <Right style={{ flexDirection: "row", flex: 2, justifyContent: "space-between" }}>
                                                    <Text style={{ fontWeight: friend.is_seen ? 'normal' : 'bold' }} note>{friend.last_message_time}</Text>
                                                </Right>
                                            </ListItem>
                                        }
                                        renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                                            <Button full danger onPress={_ =>{ this.deleteRow(secId, rowId, rowMap,data);console.log(data)}}>
                                              <Icon active name="trash" />
                                            </Button>}
                                        rightOpenValue={-75}
                                        disableLeftSwipe={false}
                                        >
                                </List>
                        :
                      null
                    }

                    {
                        this.state.dataLoaded != "done" ? 
                            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: config.screenWidth, height: config.screenHeight - 80}}>
                                <Spinner />
                                <Text style={{color: '#666', fontSize: 12, fontWeight: "bold", marginTop: 10}}>{this.state.dataLoaded} messages...</Text>
                            </View>
                        :
                        null
                    }
                </Content>);
        }
        
        return null;
    }
    goToChat(){
        
        this.props.navigation.navigate("UserChat",{friend_id: this.state.currentFriend.id, friend_name: this.state.currentFriend.name,title: this.state.currentFriend.name})
        console.log(this.state)
    }

    backToChat=()=>{
         this.getMessagesMain();
         console.log("here is backtochat")
    }
    badgeGenerator(){
        if(this.state.BadgeCount>0){
        return(<Badge style={{scaleX: 0.7, scaleY: 0.7,position:"absolute",}}>
            <Text>{this.state.BadgeCount}</Text>
        </Badge>)}else{return null}
    }


    render() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return (<Container style={{ backgroundColor: 'white', flex: 1 }}>
            <Content style={{ backgroundColor: 'white', flex: 1 }}>
                    {this.renderBody()}
                </Content>
            </Container>
        )
    }
}