import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Image, ScrollView, TouchableOpacity,BackHandler } from 'react-native';
import {
    Container, Header, Left, Body, Right, Button, Icon, Content,
    Title, Text, Form, Spinner, List, ListItem, Thumbnail
} from 'native-base';
import config from "../../src/config/app.js";
import styles from "../../style/app.js";
import storage from '../services/storage'
import api from '../services/api';
import { GiftedChat, Send } from 'react-native-gifted-chat'
import { globals } from "../services/globals";
const socketIOClient = require('socket.io-client');
let socket = socketIOClient('http://192.168.1.30:9999/', { transports: ['websocket'], jsonp: false, autoConnect: true });

var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

export default class UserChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            screen: 2,
            dataLoaded: "Loading",
            messages: [],
            friend_name: this.props.data.friend_name,
            friend_id: this.props.data.friend_id,
            chatRef: null,
            page: 0
        }
    }

    async componentDidMount() {
        // try {
        //     await storage.getItem('chat_' + this.state.friend_id).then(async (messages) => {
        //         if (messages !== null) {
        //             messages = JSON.parse(messages)
        //             this.setState(previousState => ({
        //                 messages: GiftedChat.append(previousState.messages, messages),
        //             }))
        //         }
        //         this.loadMessages(JSON.parse(messages))
        //         this.setState({page: 1})
        //     })
        // }
        // catch (error) {
        //     this.loadMessages(null)
        // }
        this.loadMessages(null)
        BackHandler.addEventListener('hardwareBackPress', () => {
           console.log("hhhhhhhhhh2");
        //    this.props.action;
           this.setState({screen:1})
        })
        
        socket.on('custom_message', function (data) {
            if (data.type=="message"){console.log(data)}
            
        });
        
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    async loadMessages(messages) {
        await storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result

            api.get_messages(this.state.friend_id, this.state.page, accessToken).then(async (response) => {
                response.data.forEach(element => {
                    element.created_at = new Date(element.created_at)
                })

                this.setState(previousState => ({
                    messages: GiftedChat.append(previousState.messages, response.data),
                    page: this.state.page + 1
                }))
            })
        })
    }

    onSend(messages = []) {
        api.send_message(this.state.friend_id, messages[0].text, accessToken).then((response) => {
            globals.mainSocket.emit('custom_message', {type:"message",
                user_id: this.state.friend_id,
                last_message_time: response.message.last_message_time,
                last_message_date: new Date(response.message.last_message_date),
                message: messages[0]
            })
        })

        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    updateMessage(data) {
        if (data.user_id == globals.user.id && data.message.user._id == this.state.friend_id) {
            this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, [data.message]),
            }))
        }
    }

    renderSend = (props) => {
        return (
            <TouchableOpacity onPress={() => {
                if (props.text.trim().length > 0)
                    this.state.chatRef.onSend({ text: props.text.trim() }, true)
            }} style={{ position: 'relative', top: 0, right: 0, }}>
                <Icon name="send" style={{ color: "deepskyblue"}} />
            </TouchableOpacity>
        );
    }

    render() {
        return (
             <Container style={{ backgroundColor: 'white', flex: 2, }}>

            <GiftedChat
                messages={this.state.messages}
                isInitialized= {true}
                onSend={messages => this.onSend(messages)}
                loadEarlier={true}
                onLoadEarlier={() => this.loadMessages(null)}
                renderSend={this.renderSend}
                ref={(ref) => { this.state.chatRef = ref; }}
                user={{
                    _id: globals.user.id,
                    avatar: globals.user.avatar
                }}
            />
             </Container>
        )
    }
}

UserChat.propTypes = {
    data: PropTypes.object.isRequired
};