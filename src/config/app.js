import {Dimensions} from 'react-native';

var {height, width} = Dimensions.get('window');

export default {
  screenWidth: width,
  screenHeight: height,
  thumbnailHeight: 120,
  thumbnailWidth: 80,
  useRCTView: true, //debug or not?
  video: {
    minWidth: width,
    minHeight: height,
    minFrameRate: 30
  }
}
