import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  BackHandler,
  Image,
  ToastAndroid,
  ImageBackground,
  AsyncStorage
} from "react-native";
import { Icon, Button } from "native-base";
import { TextField } from "react-native-material-textfield";
var _ = require("lodash");
import SplashScreen from "react-native-splash-screen";
const logo = require("../../assets/lanchatlogo.jpg");
import api from "../services/api";
import { globals } from "../services/globals";


export default class Signin extends Component {
  constructor(props) {
    super(props);
    this.onFocus = this.onFocus.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onSubmitEmail = this.onSubmitEmail.bind(this);
    this.onSubmitPassword = this.onSubmitPassword.bind(this);
    this.onAccessoryPress = this.onAccessoryPress.bind(this);
    this.renderPasswordAccessory = this.renderPasswordAccessory.bind(this);
    this.emailRef = this.updateRef.bind(this, "email");
    this.passwordRef = this.updateRef.bind(this, "password");

    this.state = {
      email: "",
      password: "",
      secureTextEntry: true
    };
  }
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      return this.handleBackButton();
    });
    SplashScreen.hide();
  }
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", () => {
      return this.handleBackButton();
    });
  }
  handleBackButton() {
    BackHandler.exitApp();
  }
  onFocus() {
    let { errors = {} } = this.state;

    for (let name in errors) {
      let ref = this[name];

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    this.setState({ errors });
  }

  onChangeText(text) {
    ["email","password"]
      .map(name => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  }

  onAccessoryPress() {
    this.setState(({ secureTextEntry }) => ({
      secureTextEntry: !secureTextEntry
    }));
  }

  onSubmitEmail() {
    this.password.focus();
  }

  onSubmitPassword() {
    this.password.blur();
  }
  renderPasswordAccessory() {
    let { secureTextEntry } = this.state;

    let name = secureTextEntry ? "visibility" : "visibility-off";

    return (
      <Icon
        size={24}
        name={name}
        color={TextField.defaultProps.baseColor}
        onPress={this.onAccessoryPress}
        suppressHighlighting
      />
    );
  }

  onSubmit=()=> {
    let errors = {};

    [ "email", "password"].forEach((name, index = 0) => {
      let value = this[name].value();
      const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!value) {
        errors[name] = "Should not be empty";
      } else {
        if ("password" === name && value.length < 6) {
          errors[name] = "Too short";
        }
        if (!this.email.value().match(mailformat)) {
          errors["email"] = "Wrong Email Format !";
        }
      }
      if (index == 1) {
        if (_.size(errors) == 0) {
          api
            .login(
              this.state.email,
              this.state.password
            )
            .then((result) => {
              console.log(result)
              if (result.message != "The given data was invalid.") {
                if (result.type !== "error") {
                  ToastAndroid.show("Welcome", ToastAndroid.SHORT);
                  AsyncStorage.setItem("accessToken", result.token);
                  AsyncStorage.setItem("name", result.name);
                  AsyncStorage.setItem("user", result);
                  globals.user = result
                  this.moveToMainAppScreen();
                }
              } else if (result.message == "The given data was invalid.") {
                var error = this.errorParser(result.errors);
                this.props.postErrorMessage(error);
              }
              this.setState({ isRegistering: false, canRegister: false });
            })
            .catch(error => {
              console.log(error);
            });
        }
      }
      index++;
    });

    this.setState({ errors });
  }

  updateRef(name, ref) {
    this[name] = ref;
  }
  
	moveToMainAppScreen = () => {
		this.props.navigation.navigate("MainAppScreen");
	};


  renderPasswordAccessory() {
    let { secureTextEntry } = this.state;

    let name = secureTextEntry ? "eye" : "eye-off";

    return (
      <TouchableOpacity onPress={this.onAccessoryPress}>
        <Icon
          type="Feather"
          name={name}
          style={{color:"white",fontSize:18,marginRight:"2%",marginTop:"1%"}}
        />
      </TouchableOpacity>
    );
  }

  render() {
    let { errors = {}, secureTextEntry, ...data } = this.state;
    let { firstname = "name", lastname = "house" } = data;

    let defaultEmail = `${firstname}@${lastname}.com`
      .replace(/\s+/g, "_")
      .toLowerCase();

    let phone = "";
    return (
        <ImageBackground source={require("../../assets/mainbg.png")}
        style={{
          height:"100%",
          width: "100%",
        }}
      >
      <View style={{backgroundColor:"rgba(11, 27, 53,0.8)",flex:1,width:"100%",height:"100%",zIndex:190}}>
      <Image
        source={require("../../assets/logofinal.png")}
        style={{
          height: 130,
          width: 130,
          marginLeft: "35%",
          marginTop: "20%"
        }}
        resizeMode="contain"
      />
        <KeyboardAvoidingView
          style={{
            backgroundColor: "transparent",
            height: 440,
            width: 320,
            marginLeft: "12%",
            marginTop: "15%"
          }}
          behavior="padding"
          enabled
        >
          <View>
            <View
              style={{
                marginBottom: "1%",
                backgroundColor: "transparent",
                borderBottomColor: "#00CED1",
                borderBottomWidth: 1,
                marginLeft: "10%",
                marginRight: "10%"
              }}
            >
              <TextField
                label="E-mail"
                ref={this.emailRef}
                value={this.state.email}
                activeLineWidth={0}
                lineWidth={0}
                labelTextStyle={{ marginLeft: "55%" }}
                fontSize={14}
                containerStyle={{ marginLeft: "5%", marginRight: "5%" }}
                inputContainerPadding={6}
                labelPadding={1}
                labelHeight={11}
                animationDuration={0}
                tintColor={"rgb(255, 255,255)"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                returnKeyType="next"
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitEmail}
                error={errors.email}
                baseColor={"rgba(255,255,255,1)"}
                textColor={"rgba(255,255,255,1)"}
              />
            </View>
            <View
              style={{
                marginBottom: "3%",
                backgroundColor: "transparent",
                borderBottomColor: "#00CED1",
                borderBottomWidth: 1,
                marginLeft: "10%",
                marginRight: "10%"
              }}
            >
              <TextField
                label="Password"
                value={this.state.password}
                ref={this.passwordRef}
                labelTextStyle={{ marginLeft: "50%" }}
                lineWidth={0}
                activeLineWidth={0}
                fontSize={14}
                containerStyle={{ backgroundColor: "transparent" }}
                inputContainerStyle={{ backgroundColor: "transparent" }}
                inputContainerPadding={6}
                labelPadding={1}
                labelHeight={11}
                animationDuration={0}
                tintColor={"rgb(255, 255,255)"}
                maxLength={30}
                secureTextEntry={this.state.secureTextEntry}
                autoCapitalize="none"
                returnKeyType="done"
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                onFocus={this.onFocus}
                onChangeText={this.onChangeText}
                onSubmitEditing={this.onSubmitPassword}
                error={errors.password}
                renderAccessory={this.renderPasswordAccessory}
                baseColor={"rgba(255,255,255,1)"}
                textColor={"rgba(255,255,255,1)"}
              />
            </View>
          </View>
          <TouchableOpacity
            style={{
              alignSelf: "center",
              backgroundColor: "#00CED1",
              width: "60%",
              height: "8%",
              marginTop: "20%"
            }}
            onPress={this.onSubmit}
          >
            <Text
              style={{
                color: "white",
                fontSize: 14,
                marginLeft: "35%",
                marginRight: "30%",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "3.5%"
              }}
            >
              SIGN  IN 
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignSelf: "center",
              backgroundColor: "transparent",
              width: "80%",
              height: "5%",
              marginTop: "2%"
            }}
            onPress={()=>this.props.navigation.navigate("Registiration")}
          >
            <Text
              style={{
                color: "white",
                fontSize: 10,
                marginLeft: "35%",
                marginRight: "30%",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "3.5%"
              }}
            >
              Forgot Password ? 
            </Text>
          </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
        </ImageBackground>
    );
  }
}
