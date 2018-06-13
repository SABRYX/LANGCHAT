import React from 'react';
import { StackNavigator } from 'react-navigation';
import Moderator from "./Moderator";
import LogSignScreen from "./LogSignScreen/LogSignScreen"
import MainAppScreen from './MainAppScreen/MainAppScreen';
import UserSettings from './User/UserSettings';
import UserFriends from './User/UserFriends';
import UserChat from './User/UserChat';
import storage from './services/storage';
import FriendRequest from "./User/FriendRequests";
import containerOfTabs from "./User/containerOfTabs";
import test from "./User/test";

const App = StackNavigator({
    Moderator: { screen: Moderator},
    LogSignScreen:{screen:LogSignScreen},
    MainAppScreen: {screen: MainAppScreen},
    UserSettings: {screen: UserSettings},
    test:{screen:test},
    UserFriends: {screen:UserFriends},
    UserChat:{screen:UserChat},
    FriendRequest:{screen:FriendRequest},
    containerOfTabs:{screen:containerOfTabs}

},{ headerMode: 'none' })

export default App;