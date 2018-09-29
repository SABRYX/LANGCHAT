import React, { Component } from 'react';
import { TouchableOpacity,BackHandler } from 'react-native';
import { Container, Icon } from 'native-base';
import storage from '../services/storage'
import api from '../services/api';
import { GiftedChat } from 'react-native-gifted-chat'
import { globals } from "../services/globals";
import { NavigationActions } from 'react-navigation' ;



export default class UserChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            screen: 2,
            dataLoaded: "Loading",
            messages: [],
            friend_name: this.props.navigation.state.params.friend_name,
            friend_id: this.props.navigation.state.params.friend_id,
            chatRef: null,
            page: 1,
            loadEarlier:true,
            myId:this.props.navigation.state.params.myId,
        }
    }

    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
         headerTitleStyle : {textAlign: 'center',alignSelf:'center'},
            headerStyle:{
                backgroundColor:'deepskyblue',
                marginTop:"4%",
            },
        });

     componentDidMount() {
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
            this.props.navigation.dispatch(NavigationActions.back({
                routeName: 'Home',
              }))
                  return true;
        })
        
        globals.mainSocket.on('chat_message',  (data)=> {
            console.log(data)
            console.log("userChat")
            console.log(globals.user.id)
                 if (data.user_id == globals.user.id){
                    console.log("test",data.message)
                    this.setState(previousState => ({
                        messages: GiftedChat.append(previousState.messages,data.message),
                    }))
                 }
        });
        
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    async loadMessages(messages) {
        await storage.getItem(storage.keys.accessToken).then((result) => {
            accessToken = result

            api.get_messages(this.state.friend_id, this.state.page, accessToken).then(async (response) => {
                console.log(response)
                response.data.forEach(element => {
                    element.created_at = new Date(element.created_at)
                })
                
                if (response.meta.current_page == response.meta.last_page){
                    this.setState({loadEarlier:false})
                    console.log(response.meta)
                }
        

                this.setState(previousState => ({
                    messages: GiftedChat.prepend(previousState.messages, response.data),
                    page: this.state.page + 1
                }))
            })
        })
    }

    onSend(messages = []) {
        api.send_message(this.state.friend_id, messages[0].text, accessToken).then((response) => {
            globals.mainSocket.emit('chat_message', {
                user_id: this.state.friend_id,
                last_message_time: response.message.last_message_time,
                last_message_date: new Date(response.message.last_message_date),
                message: messages[0]
            })

            globals.mainSocket.emit("custom_message",{type: 'CheckMessages', data: { your_id:this.state.friend_id}})
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
            }} style={{alignContent:"center",alignItems:"center",marginBottom:"3%",marginTop:"1%",marginRight:"2%",marginLeft:"2%"}}>
                <Icon name="send" style={{ color: "deepskyblue"}} />
            </TouchableOpacity>
        );
    }

    render() {
        return (
             <Container style={{ backgroundColor: 'white', flex:1 }}>
                
                <GiftedChat
                    messages={this.state.messages}
                    onSend={(messages) => this.onSend(messages)}
                    loadEarlier={this.state.loadEarlier}
                    onLoadEarlier={() => this.loadMessages(null)}
                    renderSend={this.renderSend}
                    alwaysShowSend ={true}
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
