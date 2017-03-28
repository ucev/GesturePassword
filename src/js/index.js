const React = require('react');
const ReactDOM = require('react-dom');
const WebLayout = require('./react_struct');

function init() {
  ReactDOM.render(
    <WebLayout />,
    document.getElementById("main")
  );
}

module.exports = {
  init: init
}