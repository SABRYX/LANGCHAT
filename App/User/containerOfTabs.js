import React, { Component } from 'react';
import { View, Image, ScrollView, BackHandler } from 'react-native';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Form, Spinner, List, ListItem, Thumbnail,
    Tabs,Tab
} from 'native-base';
import ImageLoad from 'react-native-image-placeholder';
import config from "../../src/config/app.js";
import styles from "../../style/app.js";
import UserFriends from './UserFriends';
import FriendRequest from "./FriendRequests";

export default class containerOfTabs extends Component {
    accessToken;

    constructor(props) {
        super(props);
        this.state = {
            screen: 1,
            dataLoaded: "Loading",
            friends: [],
            currentFriend: null,
            userChatRef: null
        }
    }

     componentDidMount() {
        console.log("i',m here")
        // BackHandler.addEventListener('hardwareBackPress',this.onBackPressed());

  
    }

    // componentWillUnmount() {
    //     BackHandler.removeEventListener('hardwareBackPress');
    // }


    // onBackPressed = () => {       
    //     if (this.state.currentFriend != null) {
    //         this.props.navigation.navigate("containerOfTabs")
    //         this.setState({ currentFriend: null })
    //         console.log("boyaacontainer")
    //     }
    //     else{   
    //         this.props.navigation.navigate("MainAppScreen")
    //         console.log("boyaaback")
    //     }

    // }

    render() {
        return (
            <Container style={{ backgroundColor: 'white', flex: 1 }}>
                <Header style={{ marginTop: 15 }} noShadow hasTabs>
                    <Left>
                        <Button transparent onPress={() => this.onBackPressed()}>
                            <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title></Title>
                    </Body>
                </Header>
                    <Tabs>
                        <Tab heading="User Friends">
                            <UserFriends />
                        </Tab>
                        <Tab heading="Friend Requests">
                            <FriendRequest />
                        </Tab>
                    </Tabs>
            </Container>
        )
    }
}