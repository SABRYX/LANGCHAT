import React, { Component } from 'react';
import { View, Image, ScrollView, BackHandler, TouchableOpacity,ListView } from 'react-native';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Form, Spinner, List, ListItem, Thumbnail, Badge
} from 'native-base';
import ImageLoad from 'react-native-image-placeholder';
import config from "../../src/config/app.js";
import styles from "../../style/app.js";
import storage from '../services/storage'
import api from '../services/api';
import { NavigationActions } from 'react-navigation' ;
import { globals } from "../services/globals";

export default class FriendRequest extends Component {
    accessToken;

    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            screen:2,
            dataLoaded: "Loading",
            friends: [],
            currentFriend: null,
            userChatRef: null
        }
    }

    componentWillMount() {
        console.log("FREIEND REQUEST")
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack()
        });

        storage.getItem(storage.keys.accessToken).then((result) => {
            this.accessToken = result
            api.get_all_requests(result).then((response) => {
                response.data.forEach((element) => {
                    this.state.friends.push(element)
                    console.log(element)
                });
                this.setState({ screen: 3, dataLoaded: "done" })
            })
        })
    }
    componentDidMount(){
        console.log("DONE request")
    }

    reject_friend_request(to) {
        api.reject_friend_request(to, this.accessToken).then((response) => {
            console.log(response)
        });
    }

    accept_friend_request(to) {
        api.accept_friend_request(to, this.accessToken).then((response) => {
            console.log(response)
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }
    deleteRow(secId, rowId, rowMap,data,type) {
        if (type=="accept"){
            this.accept_friend_request(data.from)

        }else if (type=="reject"){
            this.reject_friend_request(data.from)
            console.log(data.from)

        }
        rowMap[`${secId}${rowId}`].props.closeRow();
        const newData = [...this.state.friends];
        newData.splice(rowId, 1);
        this.setState({ friends: newData });
      }

    renderBody() {
        console.log(this.state.dataLoaded)
            return (

                <Content style={{ width: config.screenWidth }}>
                 {

                    this.state.dataLoaded == "done" ?
                        <List style={{ marginTop: 5 }}  dataSource={this.ds.cloneWithRows(this.state.friends)}
                                renderRow={(friend, s1, index) =>
                                    <ListItem style={{ backgroundColor: 'transparent', marginTop: "2%", flexDirection: "row", flex: 1 }}>
                                        <Left style={{ margin: "0%", flex: 1 }}>
                                            {/* <Thumbnail source={{uri: friend.avatar}} /> */}
                                            <ImageLoad
                                                style={{ width: 50, height: 50 }}
                                                loadingStyle={{ width: 50, height: 50 }}
                                                placeholderStyle={{ width: 50, height: 50, resizeMode: Image.resizeMode.stretch, borderRadius: 50 }}
                                                borderRadius={50}
                                                source={{ uri: friend.friend.avatar }} />

                                        </Left>
                                        <Body style={{ marginLeft: "0%", width: 180, flex: 3 }}>
                                            <Text style={{ fontWeight: 'normal', textAlign: "left" }}>{friend.friend.name}</Text>
                                        </Body>
                                    </ListItem>
                                }  renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                                    <Button full danger onPress={_ => this.deleteRow(secId, rowId, rowMap,data,"reject")}>
                                      <Icon active name="remove" type="FontAwesome" />
                                    </Button>}
                                    renderLeftHiddenRow={(data, secId, rowId, rowMap) =>
                                        <Button full success onPress={_ => this.deleteRow(secId, rowId, rowMap,data,"accept")}>
                                          <Icon active name="check" type="FontAwesome" />
                                        </Button>}
                                    rightOpenValue={-75}
                                    leftOpenValue={75}
                                    >
                            </List>
                             :
                             null
                     }

                    {
                        this.state.dataLoaded != "done" ?
                            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: config.screenWidth, height: config.screenHeight - 80 }}>
                                <Spinner />
                                <Text style={{ color: '#666', fontSize: 12, fontWeight: "bold", marginTop: 10 }}>{this.state.dataLoaded} Friend Requests...</Text>
                            </View>
                            :
                            null
                    }
                </Content>)
    }



    render() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        return (
            <Container style={{ backgroundColor: 'white', flex: 1 }}>
            <Content style={{ backgroundColor: 'white', flex: 1 }}>
           
                {this.renderBody()}
                
                </Content>
            </Container>
        )
    }
}