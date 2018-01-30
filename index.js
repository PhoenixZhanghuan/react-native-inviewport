'use strict';

import React, {PropTypes, Component} from 'react';
import {
  InteractionManager,
  StyleSheet,
  View,
  ListView,
  Text,
  Image,
  Platform,
  NativeMethodsMixin,
  Dimensions
} from 'react-native';

const window = Dimensions.get('window');

module.exports = React.createClass({
  displayName: 'InViewPort',
  mixins: [NativeMethodsMixin],
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    active: React.PropTypes.bool,
    delay: React.PropTypes.number,
    showVideo: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      active: true,
      delay: 500
    };
  },

  getInitialState: function(){
    return {
      rectTop: 0,
      rectBottom: 0
    }
  },
  componentDidMount: function () {
    if (this.props.active) {
      this.startWatching();
    }
  },

  componentWillUnmount: function () {
    this.stopWatching();
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.active) {
      this.lastValue = null;
      this.startWatching();
    } else {
      this.stopWatching();
    }
  },

  startWatching: function () {
    if (this.interval) { return; }
    this.interval = setInterval(this.check, this.props.delay);
  },

  stopWatching: function () {
    this.interval = clearInterval(this.interval);
  },
  /**
   * Check if the element is within the visible viewport
   */
  check: function () {
    var el = this.refs.myview;
    var rect = el.measure((ox, oy, width, height, pageX, pageY) => {
      this.setState({
        rectTop: pageY,
        rectBottom: pageY + height
      })
    });

    let isVisible;

    // 如果是视频的话，就会全部显示出来才显示，如果是图片则显示一部分就开始加载。
    if(this.props.showVideo) {
      isVisible = (
        this.state.rectTop >= 0 && this.state.rectBottom <= window.height
      );
    }else {
      isVisible = (
        (this.state.rectTop < 0 && this.state.rectBottom > 0) || (this.state.rectTop > 0 && this.state.rectBottom > window.height) ||
        (this.state.rectTop >= 0 && this.state.rectBottom <= window.height)
      );
    }

    // notify the parent when the value changes
    if (this.lastValue !== isVisible) {
      this.lastValue = isVisible;
      this.props.onChange(isVisible);
    }
  },

  render: function () {
    return (
      <View ref='myview' {...this.props}>
        {this.props.children}
      </View>
    );
  }
});
