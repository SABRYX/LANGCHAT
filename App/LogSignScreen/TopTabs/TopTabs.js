import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Text } from 'native-base';
import { View } from 'react-native-animatable';

export default class TopTabs extends Component {
  constructor() {
    super();
    this.state = {
      currentTabIndex: 0, // eslint-disable-line
      tabsStyles: [GLOBAL.topTabsStyle.topTabButtonOn, GLOBAL.topTabsStyle.topTabButtonOff],
    };
  }

  render() {
    return (
      <View animation="fadeInLeft" delay={750} duration={700} style={[GLOBAL.topTabsStyle.view, {paddingHorizontal: 16}]}>
        <Button
          rounded 
          full
          activeOpacity={1}
          style={[this.state.tabsStyles[0], {borderTopLeftRadius: 6}]}
          onPress={this.props.switch(0)}
        >
          <Text style={GLOBAL.topTabsStyle.text} uppercase={false}>{language.loginTab}</Text>
        </Button>
        <Button
          rounded 
          full
          activeOpacity={1}
          style={[this.state.tabsStyles[1], {borderTopRightRadius: 6}]}
          onPress={this.props.switch(1)}
        >
          <Text style={GLOBAL.topTabsStyle.text} uppercase={false}>{language.newAccount}</Text>
        </Button>
      </View>
    );
  }
}

TopTabs.propTypes = {
  switch: PropTypes.func.isRequired,
};
