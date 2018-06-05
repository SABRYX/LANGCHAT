import {StyleSheet} from 'react-native';
import config from "../src/config/app.js";

export default StyleSheet.create({
  container: {
    width: config.screenWidth,
    height: config.screenHeight - (config.thumbnailHeight + 80)
  },
  video: {
    width: config.screenWidth,
    height: config.screenHeight
  }
});
