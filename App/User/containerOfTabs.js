import React, { Component } from 'react';
import { View, Image, ScrollView, BackHandler } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Form, Toast, Spinner, List, ListItem, Thumbnail,
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
        BackHandler.addEventListener('hardwareBackPress', () => {
            if (this.state.screen == 1) {
                Actions.pop();
                return true;
            }
            else this.setState({ screen: 1 })

            return true;
        });

  
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }


    onBackPressed = () => {
		console.log('UserFriends', Actions.currentScene)        
        if (this.state.screen != 1) {
            this.setState({ screen: 1, currentFriend: null })
            return false
        }

        Actions.pop()
        return true
    }

    render() {
        return (
            <Container style={{ backgroundColor: 'white', flex: 1 }}>
                <Header style={{ marginTop: 15 }} noShadow hasTabs>
                    <Left>
                        <Button transparent onPress={() => Actions.pop()}>
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