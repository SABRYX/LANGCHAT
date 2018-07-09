import { StackNavigator,TabNavigator } from 'react-navigation';
import Moderator from "./Moderator";
import LogSignScreen from "./LogSignScreen/LogSignScreen"
import MainAppScreen from './MainAppScreen/MainAppScreen';
import UserSettings from './User/UserSettings';
import UserFriends from './User/UserFriends';
import UserChat from './User/UserChat';
import FriendRequest from "./User/FriendRequests";
import SignInScreen from "./LogSignScreen/SignInScreen/SignInScreen"
import containerOfTabs from "./User/containerOfTabs"

const App = StackNavigator({
    Moderator: { screen: Moderator,navigationOptions: { header: null }},
    LogSignScreen:{screen:LogSignScreen,navigationOptions: { header: null }},
    MainAppScreen: {screen: MainAppScreen,navigationOptions: { header: null }},
    UserSettings: {screen: UserSettings,navigationOptions: { header: null }},
    SignInScreen: {screen: SignInScreen,navigationOptions: { header: null }},
    UserChat:{screen:UserChat},
    Home:{
    screen: TabNavigator({
        UserFriends: { screen: UserFriends },
        FriendRequest: { screen: FriendRequest }
   },
   {
    tabBarOptions: {style:{marginTop:"0%",backgroundColor:"deepskyblue"},
    },
    initialRouteName: 'UserFriends',
    swipeEnabled:false,
    animationEnabled: true,       // add this to fix
    lazy: false,     
 }),
 }
},
{
  headerMode: 'screen',
  navigationOptions: {
    headerStyle: { backgroundColor: 'deepskyblue',marginTop:"4%",
    shadowColor : '#5bc4ff',
    shadowOpacity: 0,
    shadowOffset: {
    height: 0
    },
    shadowRadius: 0,
    elevation: 0},
    headerTintColor:"white"
      }
 });


export default App;