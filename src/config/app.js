import {Dimensions} from 'react-native';

const window = Dimensions.get('window');

export default {
  screenWidth: window.width,
  screenHeight: window.height,
  thumbnailHeight: 120,
  thumbnailWidth: 80,
  useRCTView: true, //debug or not?
  video: {
    minWidth: this.screenWidth,
    minHeight: this.screenHeight,
    minFrameRate: 30
  }
}
