const React = require('react');
const ReactDOM = require('react-dom');

class Title extends React.Component {
  render () {
    return (
      <h1 id = "main_title">手势密码</h1>
    );
  }
}

class GestureOpeItem extends React.Component {
  constructor(props) {
    super(props);
    this.onInputClicked = this.onInputClicked.bind(this);
  }
  onInputClicked(e) {
    this.props.click(this.props.type);
  }
  render() {
    var id = "ope_radio_" + this.props.type;
    var isChecked = "";
    if (this.props.type == this.props.curtype) {
      isChecked = "checked";
    }
    return (
      <p className = "ope_item">
        <input className = "ope_radio" id = {id} type = "radio" name = "ope_type" checked = {isChecked} onChange = {this.onInputClicked}/>
        <label className = "ope_label" for = {id}>{this.props.title}</label>
      </p>
    )
  }
}

class GestureOpeBar extends React.Component {
  render() {
    return (
      <div id = "ope_div">
        <GestureOpeItem title = "设置密码" type = "set" curtype = {this.props.opeType} click = {this.props.click}/>
        <GestureOpeItem title = "验证密码" type = "check" curtype = {this.props.opeType} click = {this.props.click}/>
      </div>
    )
  }
}

class GestureCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.styles = {
      "chosen": {
        fill: "#FFA726",
        stroke: "#FC9207"
      },
      "unchosen": {
        fill: "#FFF",
        stroke: "#C2C2C2"
      },
      "line": {
        fill: "#DF3134",
        stroke: "#DF3134"
      }
    }
    this.chosenState = [
      [false, false, false],
      [false, false, false],
      [false, false, false]
    ]
    this.gesturePoints = [];
    this.initCanvas = this.initCanvas.bind(this);
    this.drawCanvas = this.drawCanvas.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.__touchStart = this.__touchStart.bind(this);
    this.__touchEnd = this.__touchEnd.bind(this);
    this.__touchMove = this.__touchMove.bind(this);
    this.convertPosX = this.convertPosX.bind(this);
    this.convertPosY = this.convertPosY.bind(this);
    this.validPoint = this.validPoint.bind(this);
    this.sendGesture = this.sendGesture.bind(this);
    this.mouse = false;
    this.currX = 0;
    this.currY = 0;
  }

  componentDidMount() {
    var that = this;
    this.preOnResize = window.onresize;
    window.onresize = function(e) {
      if (typeof this.preOnResize == "function") 
        this.preOnResize();
      that.__init();
    }
    this.__init();
  }

  componentWillUnmount() {
    window.onresize = this.preOnResize;
  }

  __init() {
    var canvas = this.canvas;
    var s = canvas.ownerDocument.defaultView.getComputedStyle(canvas);
    var width = parseInt(s.width);
    var height = parseInt(s.height);
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    var min = width < height ? width : height;
    var blen = min / 4;
    var points = [];
    var startX;
    var startY;
    if (width == min) {
      startX = blen;
      startY = (height - blen * 2) / 2;
    } else {
      startX = (width - blen * 2) / 2;
      startY = blen;
    }
    for (var i = 0; i < 3; i++) {
      var y = startY + blen * i;
      var arr = [];
      for (var j = 0; j < 3; j++) {
        var x = startX + blen * j;
        arr.push([x, y]);
      }
      points.push(arr);
    }
    this.points = points;
    this.radius = blen / 4;
    var bbox = canvas.getBoundingClientRect();
    this.ratioX = canvas.width / bbox.width;
    this.ratioY = canvas.height / bbox.height;
    this.offsetX = bbox.left;
    this.offsetY = bbox.top;
    this.initCanvas();
  }

  initCanvas() {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        this.chosenState[i][j] = false;
      }
    }
    this.gesturePoints = [];
    this.drawCanvas();
  }

  drawCanvas(drawEnd=true) {
    var canvas = this.canvas;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var x = this.points[i][j][0];
        var y = this.points[i][j][1];
        var pointState = this.chosenState[i][j] ? "chosen" : "unchosen";
        context.fillStyle = this.styles[pointState].fill;
        context.strokeStyle = this.styles[pointState].stroke;
        context.beginPath();
        context.arc(x, y, this.radius, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
      }
    }
    if (this.gesturePoints.length > 0) {
      context.beginPath();
      context.fillStyle = this.styles.line.fill;
      context.strokeStyle = this.styles.line.stroke;
      var p = this.gesturePoints[0];
      context.moveTo(this.points[p[0]][p[1]][0], this.points[p[0]][p[1]][1]);
      for (var i = 1; i < this.gesturePoints.length; i++) {
        p = this.gesturePoints[i];
        context.lineTo(this.points[p[0]][p[1]][0], this.points[p[0]][p[1]][1]);
      }
      if (drawEnd) {
        context.lineTo(this.currX, this.currY);
      }
      context.stroke();
    }
  }

  mouseDown(e) {
    this.__touchStart(e.pageX, e.pageY);
  }

  mouseUp(e) {
    this.__touchEnd();
  }

  mouseMove(e) {
    this.__touchMove(e.pageX, e.pageY);
  }

  touchStart(e) {
    var touch = e.touches[0];
    this.__touchStart(touch.pageX, touch.pageY);
  }

  touchEnd() {
    this.__touchEnd();
  }

  touchMove(e) {
    var touch = e.touches[0];
    this.__touchMove(touch.pageX, touch.pageY);
  }

  __touchStart(x, y) {
    if (this.props.drawable) {
      this.mouse = true;
      this.currX = this.convertPosX(x);
      this.currY = this.convertPosY(y);
    }
  }

  __touchEnd() {
    this.mouse = false;
    this.drawCanvas(false);
    this.sendGesture();
  }

  __touchMove(x, y) {
    if (this.mouse && this.props.drawable) {
      var newX = this.convertPosX(x);
      var newY = this.convertPosY(y);
      var canvas = this.canvas;
      var context = canvas.getContext("2d");
      this.validPoint(newX, newY);
      this.drawCanvas();
      this.currX = newX;
      this.currY = newY;
    }
  }

  validPoint(x, y) {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var centerX = this.points[i][j][0];
        var centerY = this.points[i][j][1];
        // 判断当前手指位置是否在点的有效范围内
        if (Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2) < Math.pow(this.radius, 2)) {
          // 如果是没有点被选择，则当前点无论如何都可以选择
          if (this.gesturePoints.length == 0) {
            this.chosenState[i][j] = true;
            this.gesturePoints.push([i, j]);
            return true;
          }
          var lastPoint = this.gesturePoints[this.gesturePoints.length - 1];
          // 当前点与最后一个有效点是同一个点的不约
          if (lastPoint[0] == i && lastPoint[1] == j) {
            return false;
          }
          // 当前点和最后一个有效点的连线上有其他点的不约
          if ((Math.abs(lastPoint[0] - i) == 2 && Math.abs(lastPoint[1] - j) == 0) ||
              (Math.abs(lastPoint[0] - i) == 0 && Math.abs(lastPoint[1] - j) == 2) ||
              (Math.abs(lastPoint[0] - i) == 2 && Math.abs(lastPoint[1] - j) == 2)
          ) {
            return false;
          }
          // 当前点和最后一个点之间已经又过连线的不约
          var p1 = this.getPointOrder(i, j);
          var p2 = this.getPointOrder(lastPoint[0], lastPoint[1]);
          if (this.gesturePoints.length >= 2) {
            for (var pi = 0; pi < this.gesturePoints.length - 1; pi++) {
              var prevP = this.gesturePoints[pi];
              var nextP = this.gesturePoints[pi + 1];
              var ppn = this.getPointOrder(prevP[0], prevP[1]);
              var npn = this.getPointOrder(nextP[0], nextP[1]);
              if ((ppn == p1 && npn == p2) || (ppn == p2 && npn == p1)) {
                return false;
              }
            }
          }
          this.chosenState[i][j] = true;
          this.gesturePoints.push([i, j]);
          return true;
        }
      }
    }
    return false;
  }

  sendGesture() {
    var res = [];
    for (var pot of this.gesturePoints) {
      res.push(this.getPointOrder(pot[0], pot[1]));
    }
    this.props.result(res);
  }

  convertPosX(x) {
    return (x - this.offsetX) * this.ratioX;
  }

  convertPosY(y) {
    return (y - this.offsetY) * this.ratioY;
  }

  getPointOrder(x, y) {
    return x * 3 + y + 1;
  }

  render() {
    return (
      <canvas ref = {(canvas) => {this.canvas = canvas;}} id = "gesture_canvas" onMouseMove = {this.mouseMove} onMouseDown = {this.mouseDown} onMouseUp = {this.mouseUp} onMouseLeave = {this.mouseUp} onTouchStart = {this.touchStart} onTouchMove = {this.touchMove} onTouchEnd = {this.touchEnd} onTouchCancel = {this.touchEnd}></canvas>
    )
  }
}

class GestureTitle extends React.Component {
  render() {
    return (
      <h3 id = "gesture_title">{this.props.title}</h3>
    )
  }
}


class GesturePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasKey: 0, // 刷新 canvas
      drawable: true, // canvas 是否响应绘画动作
      opeType: "set", // 大的状态，对应下面的 radio
      subType: "set", // 大状态下面的小状态，用于分类操作
      gesturePoints: []
    }
    // 不同小状态对应的标题
    this.title = {
      set: "请输入手势密码",
      tooShort: "密码太短，至少需要5个点",
      reInput: "请再次输入手势密码",
      setFail: "两次输入不一致",
      setSucc: "密码设置成功",
      check: "请输入手势密码",
      checkFail: "输入的密码不正确",
      checkSucc: "密码正确!"
    }
    this.onOpeTypeChange = this.onOpeTypeChange.bind(this);
    this.gestureResult = this.gestureResult.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.getPassword = this.getPassword.bind(this);
    this.setStateAfterTime = this.setStateAfterTime.bind(this);
    // 状态更新 Timeout
    this.setStateTimeout = null;
  } 
  onOpeTypeChange(type) {
    if (this.setStateTimeout != null) {
      clearTimeout(this.setStateTimeout);
      this.setStateTimeout = null;
    }
    this.setState((prevState, props) => ({
      opeType: type,
      subType: type,
      drawable: true,
      canvasKey: prevState.canvasKey + 1
    }));
  }
  gestureResult(points) {
    switch(this.state.opeType) {
      case "set":
        switch(this.state.subType) {
          case "set":
            if (points.length < 5) {
              this.setState({
                subType: "tooShort",
                drawable: false
              });
              this.setStateAfterTime({
                subType: "set",
                drawable: true,
                canvasKey: this.state.canvasKey + 1
              })
            } else {
              this.setState((prevState, props) => ({
                subType: "reInput",
                gesturePoints: points,
                canvasKey: prevState.canvasKey + 1
              }))
            }
            return;
          case "reInput":
            var prevPoints = this.state.gesturePoints;
            if (prevPoints.length != points.length) {
              this.setState((prevState, props) => ({
                subType: "setFail",
                drawable: false,
                gesturePoints: [],
              }))
              this.setStateAfterTime({
                subType: "set",
                drawable: true,
                canvasKey: this.state.canvasKey + 1
              })
            } else {
              for (var i = 0; i < prevPoints.length; i++) {
                if (prevPoints[i] != points[i]) {
                  this.setState((prevState, props) => ({
                    subType: "setFail",
                    gesTurePoints: [],
                    canvasKey: prevState.canvasKey + 1
                  }))
                  this.setStateAfterTime({
                    subType: "set",
                    drawable: true,
                    canvasKey: this.state.canvasKey + 1
                  })
                  return;
                }
              }
              this.setPassword(points);
              this.setState({
                subType: "setSucc",
                drawable: false
              })
              this.setStateAfterTime({
                opeType: "check",
                subType: "check",
                drawable: true,
                canvasKey: this.state.canvasKey + 1
              })
            }
            return;
          default:
            return;
        }
        return;
      case "check":
        switch(this.state.subType) {
          case "check":
            var password = this.getPassword();
            if (password.length != points.length) {
              this.setState({
                subType: "checkFail",
                drawable: false
              })
              this.setStateAfterTime({
                subType: "check",
                drawable: true,
                canvasKey: this.state.canvasKey + 1
              })
            } else {
              for (var i = 0; i < password.length; i++) {
                if (password[i] != points[i]) {
                  this.setStateAfterTime({
                    subType: "checkFail",
                    drawable: false
                  })
                  this.setStateAfterTime({
                    subType: "check",
                    drawable: true,
                    canvasKey: this.state.canvasKey + 1
                  })
                  return;
                }
              }
              this.setState({
                subType: "checkSucc",
                drawable: false
              })
            }
            return;
          default:
            return;
        }
        return;
      default:
        return;
    }
  }
  setPassword(points) {
    localStorage.setItem("password", JSON.stringify(points));
  }
  getPassword() {
    var pts = localStorage.getItem("password");
    return JSON.parse(pts);
  }
  setStateAfterTime(newState, atime = 1000) {
    var that = this;
    this.setStateTimeout = setTimeout(function() {
      that.setState(newState);
    }, atime);
  }
  render() {
    return (
      <div id = "gesture_div">
        <GestureCanvas key = {this.state.canvasKey} result = {this.gestureResult} drawable = {this.state.drawable}/>
        <GestureTitle title = {this.title[this.state.subType]}/>
        <GestureOpeBar opeType = {this.state.opeType} click = {this.onOpeTypeChange}/>
      </div>
    )
  }
}

class WebLayout extends React.Component {
  render() {
    return (
      <div>
        <Title />
        <GesturePassword />
      </div>
    )
  }
}

module.exports = WebLayout;