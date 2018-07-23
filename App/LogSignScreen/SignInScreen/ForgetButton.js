import React, { Component } from 'react';
import { View } from 'react-native-animatable';
import { Text, Spinner, Button } from 'native-base';

export default class ForgetButton extends Component {
  constructor() {
    super();
    this.state = {
      isRegistering: false,
    };
  }

  forgetPassword=()=>{
    this.setState({isRegistering:true})
    alert(this.props.property)
  }

  render() {
    const { navigate } = this.props.navigation;

    if (this.state.canRegister) {
      animationType = 'pulse';
      registerColor = mainThemeColor;
    } else {
      registerColor = mainThemeColor;
      animationType = null;
    }

    let indicator = (<Text uppercase={false} style={{ color: "grey", fontWeight: '500', fontSize: GLOBAL.totalSize(2.22) }}>{language.forget}</Text>);
    if (this.state.isRegistering) {
      indicator = (<Spinner color={"deepskyblue"} size="large" />);
    }

    return (
      <View>
        <Button
          bordered
          rounded
          activeOpacity={0.5}
          onPress={this.forgetPassword}
          style={{
            borderColor: "#E0E0E0", alignSelf: 'center', justifyContent: 'center', width: (width * 13) / 20, height: height / 14,
          }}
        >
          {indicator}
        </Button>
      </View>
    );
  }
}

