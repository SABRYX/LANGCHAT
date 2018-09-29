import {StyleSheet} from 'react-native';
import config from "../src/config/app.js";

export default StyleSheet.create({
  thumbnailContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    height: config.thumbnailHeight + 7,
    width: config.screenWidth - 15,
  },
  thumbnail: {
    height: config.thumbnailHeight,
    width: config.thumbnailWidth,
    borderRadius: 10
  },
  activeThumbnail: {
    height: config.thumbnailHeight,
    width: config.thumbnailWidth
  }
});
