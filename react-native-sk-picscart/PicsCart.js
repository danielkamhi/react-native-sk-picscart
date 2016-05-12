'use strict'

var React = require('react-native');

var {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight,
  Animated,
  Platform,
  Dimensions,
  NativeModules
} = React;

var {width, height} = Dimensions.get('window'),
    ImagePickerManager = NativeModules.ImagePickerManager;

/**
 * 图片挑选组件
 */
 // 单个图片显示
var Pic = React.createClass({
  getDefaultProps: function() {
    return {
      index: null,
      onRemove: function() {},
    };
  },
  getInitialState: function() {
    return {
      value: '',
    };
  },
  render: function() {
    return (
      <View style={styles.picView}>
        {/* 图片 */}
        <Image source={this.props.source} isThumbnail={true} style={styles.pic}></Image>
        {/* 删除按钮 */}
        <TouchableHighlight onPress={this.handlePress} style={styles.picRemove}>
          <Image source={require('./img/cancel.png')} style={styles.picRemoveX} />
        </TouchableHighlight>
      </View>
    );
  },
  handlePress: function() {
    this.props.onRemove.call(null, this.props.index, this.props.source);
  }
});

// 加号按钮: 添加图片
var Plus = React.createClass({
  getDefaultProps: function() {
    return {
      maxSelection: 5,
      onPress: function() {},
      underlayColorRGB: 'rgb(220,220,220)',
    };
  },
  getInitialState: function() {
    return {
      isDisabled: false,
      hightlightColor: new Animated.Value(0),
    };
  },
  render: function() {
    var color = this.state.hightlightColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgb(255,255,255)', this.props.underlayColorRGB]
    });
    return (
        <TouchableHighlight underlayColor={this.props.underlayColorRGB} onPress={this.handlePress} style={styles.plus}>
          <Animated.Image source={require('./img/add.png')} style={[styles.plusPlus, {backgroundColor: color}]} />
        </TouchableHighlight>
    );
  },
  handlePress: function() {
    this.state.hightlightColor.setValue(1);
    Animated.timing(
      this.state.hightlightColor,
      {
        toValue: 0,
        duration: 1000,
        // delay: 500,
      }
    ).start();
    if (this.props.onPress) {
      this.props.onPress.call();
    }
  }
});

// 图片选择器
var PicsCart = React.createClass({
  getDefaultProps: function() {
    return {
      maxSelection: 5, // 最大图片数
      pics: [],
      onChange: null,
    };
  },
  getInitialState: function() {
    return {
      pics: this.props.pics,
    };
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      pics: nextProps.pics
    });
  },
  render: function() {
    var max = this.props.maxSelection === null ?  null : this.props.maxSelection - this.state.pics.length;
    var displayPlus = ! (max <= 0);
    var that = this;
    return (
      <View style={[styles.picsCart, this.props.style]}>
        {/* 图片列表 */}
        {this.state.pics.map(function(pic, i){
          return (<Pic key={i} source={pic} index={i} onRemove={that.handleRemove}/>);
        })}
        {/* 加号: 添加图片 */}
        { displayPlus && <Plus onPress={this.handlePressPlus}/> }
      </View>
    );
  },
  // 处理图片删除
  handleRemove: function(index, pic) {
    if (! this.props.willRemovePic || this.props.willRemovePic(index, pic)) {
      this.removePic(index,pic);
      this.props.handleDeletedPhoto(index, pic);
    }
  },
  // 删除图片
  removePic: function(index, pic) {
    if (index === null) {
      for (var i=0; i<this.state.pics.length; i++) {
        if (this.state.pics[i].uri === pic.uri) {
          index = i;
          break;
        }
      }
    }
    if (index === null) return;
    var newPics = React.addons.update(this.state.pics, { $splice: [[index, 1]] });
    this.setState({
      pics: newPics,
    }, this.handleChange);
  },
  // 处理添加图片
  handlePressPlus: function() {
    var max = this.props.maxSelection === null ?  null : this.props.maxSelection - this.state.pics.length;
    if (max <= 0) {
      return;
    }
    var options = {
      title: 'Select Avatar', // specify null or empty string to remove the title
      cancelButtonTitle: 'Cancel',
      takePhotoButtonTitle: 'Take Photo...', // specify null or empty string to remove this button
      chooseFromLibraryButtonTitle: 'Choose from Library...', // specify null or empty string to remove this button
      customButtons: {
        'Choose Photo from Facebook': 'fb', // [Button Text] : [String returned upon selection]
      },
      cameraType: 'back', // 'front' or 'back'
      mediaType: 'photo', // 'photo' or 'video'
      videoQuality: 'high', // 'low', 'medium', or 'high'
      maxWidth: 100, // photos only
      maxHeight: 100, // photos only
      aspectX: 2, // aspectX:aspectY, the cropping image's ratio of width to height
      aspectY: 1, // aspectX:aspectY, the cropping image's ratio of width to height
      quality: 0.2, // photos only
      angle: 0, // photos only
      allowsEditing: false, // Built in functionality to resize/reposition the image
      noData: false, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
      storageOptions: { // if this key is provided, the image will get saved in the documents/pictures directory (rather than a temporary directory)
        skipBackup: true, // image will NOT be backed up to icloud
        path: 'images' // will save image at /Documents/images rather than the root
      }
    };

    /**
    * The first arg will be the options object for customization, the second is
    * your callback which sends bool: didCancel, object: response.
    *
    * response.didCancel will inform you if the user cancelled the process
    * response.error will contain an error message, if there is one
    * response.data is the base64 encoded image data (photos only)
    * response.uri is the uri to the local file asset on the device (photo or video)
    * response.isVertical will be true if the image is vertically oriented
    * response.width & response.height give you the image dimensions
    */
    ImagePickerManager.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        var source;
        // You can display the image using either data:
        // source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};
        if(Platform.OS === 'ios'){ // uri (on iOS)
          source = {uri: response.uri.replace('file://', ''), isStatic: true};
        }else{ // uri (on android)
          source = {uri: response.uri, isStatic: true};
        }
        this.addPic(source);
      }
    });
  },
  // 添加图片
  addPic: function(pic) {
    var newPics = React.addons.update(this.state.pics, { $push: [pic] });
    this.setState({
      pics: newPics,
    }, this.handleChange)
  },
  // 当增删图片时, 调用回调
  handleChange: function() {
    if (this.props.onChange) {
      this.props.onChange.call(null, this.state.pics);
    }
  }
});

// 间隔
var ITEM_SPACING = 12; // 建议在引用PicsCart的表单中，其左侧间隔（如marginLeft）也为ITEM_SPACING
// 图片大小
var ITEM_SIZE = (width - ITEM_SPACING * 5) / 4;
// 删除'x'图标大小
var X_SIZE = 18;
// 行间距
var ROW_SPACING = 10;

var styles = StyleSheet.create({
  picView: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: 11,
    marginTop: ROW_SPACING,
  },
  pic: {
    // flex: 1,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 1,
  },
  picRemove: {
    top: -(ITEM_SIZE + 5),
    left: -(5),
    width: X_SIZE,
    height: X_SIZE,
    backgroundColor: '#3D3D3D',
    opacity: 1,
    borderRadius: X_SIZE / 2,
    // borderWidth: 0.5,
    // borderColor: 'rgba(255,255,255,0.5)',
    padding: X_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picRemoveX: {
    width: X_SIZE,
    height: X_SIZE,
    borderRadius: X_SIZE / 2,
  },
  plus: {
    marginTop: ROW_SPACING,
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  plusPlus: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  picsCart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
  }
});

module.exports = PicsCart;
