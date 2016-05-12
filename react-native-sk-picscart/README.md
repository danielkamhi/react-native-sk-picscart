# react-native-sk-picscart

##What is it

react-native-sk-picscart is a component to show the picture you choose from the device library or directly from the camera. It's easy to add or delete a picture.

Depends on [react-native-image-picker](https://github.com/marcshilling/react-native-image-picker)

Thanks for my colleague [万能](https://github.com/monyxie), who wrote first version of code.

##How to use it

1. install [react-native-image-picker](https://github.com/marcshilling/react-native-image-picker#install)

2. `npm install react-native-sk-picscart@latest --save`

3. Write this in index.ios.js / index.android.js

```javascript
 'use strict';
 import React, {
   AppRegistry,
   StyleSheet,
   Text,
   View
 } from 'react-native';

 var PicsCart = require('react-native-sk-picscart');

 var test = React.createClass({
   getInitialState: function() {
     return {
       pics: []
     };
   },
   render: function(){
     return (
       <View style={styles.container}>
         <PicsCart
           style={styles.picsCart}
           onChange={this.onPicsChange}
           pics={this.state.pics}
           maxSelection={5}
           />
        <View style={styles.detailBox}>
          {this.state.pics.map(this.renderPicDetail)}
        </View>
       </View>
     )
   },
   renderPicDetail: function(pic, i){
     return (
       <Text key={i}>
        {'\npic' + (i + 1) + ' detail: \n' + JSON.stringify(pic)}
       </Text>
     )
   },
   onPicsChange: function(pics){
     this.setState({pics})
   },
 });


 const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: '#F5FCFF',
   },
   picsCart: {
     marginVertical: 12,
     marginHorizontal: 6,
   },
   detailBox: {
     justifyContent: 'space-around',
   },
 });
 
 AppRegistry.registerComponent('test', () => test);

```
![](https://raw.githubusercontent.com/shigebeyond/react-native-sk-picscart/master/demo.gif)

##Properties

Any [View property](http://facebook.github.io/react-native/docs/view.html) and the following:

| Prop | Description | Default |
|---|---|---|
|**`pics`**|The selected pictures to show. |*None*|
|**`onChange`**|Callback that is called when the selected pictures changes. |*None*|
|**`maxSelection`**|Max selected picture number. |*None*|
