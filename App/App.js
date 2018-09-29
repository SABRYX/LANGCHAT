import { StackNavigator, TabNavigator } from "react-navigation";
import Moderator from "./Moderator";
import ForgetPassword from "./User/ForgetPassword";
import Registiration from "./LogSignScreen/Registiration";
import Signin from "./LogSignScreen/Signin";
import MainAppScreen from "./MainAppScreen/MainAppScreen";
import UserSettings from "./User/UserSettings";
import UserFriends from "./User/UserFriends";
import UserChat from "./User/UserChat";
import FriendRequest from "./User/FriendRequests";
import ResetPassword from "./User/ResetPassword";
import Splash from "./User/SplashScreen";

const App = StackNavigator(
  {
    Moderator: { screen: Moderator, navigationOptions: { header: null } },
    Splash: { screen: Splash, navigationOptions: { header: null } },
    Registiration: {
      screen: Registiration,
      navigationOptions: { header: null }
    },
    Signin: { screen: Signin, navigationOptions: { header: null } },
    ForgetPassword: {
      screen: ForgetPassword,
      navigationOptions: { header: null }
    },
    ResetPassword: {
      screen: ResetPassword,
      navigationOptions: { header: null }
    },
    MainAppScreen: {
      screen: MainAppScreen,
      navigationOptions: { header: null }
    },
    UserSettings: { screen: UserSettings, navigationOptions: { header: null } },
    UserChat: { screen: UserChat },
    Friends: { screen: UserFriends, navigationOptions: { header: null } },
    Home: {
      screen: TabNavigator(
        {
          Friends: { screen: UserFriends },
          "Friend Requests": { screen: FriendRequest }
        },
        {
          tabBarOptions: {
            style: { marginTop: "0%", backgroundColor: "deepskyblue" },
            activeTintColor: "white",
            inactiveTintColor: "#e8e8e8"
          },
          initialRouteName: "Friends",
          swipeEnabled: false,
          animationEnabled: true, // add this to fix
          lazy: false
        }
      )
    }
  },
  {
    headerMode: "screen",
    navigationOptions: {
      headerStyle: {
        backgroundColor: "deepskyblue",
        marginTop: "4%",
        shadowColor: "#5bc4ff",
        shadowOpacity: 0,
        shadowOffset: { height: 0 },
        shadowRadius: 0,
        elevation: 0
      },
      headerTintColor: "white"
    },
    portraitOnlyMode: true
  }
);

export default App;
