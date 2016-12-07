import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';

import { Progress } from 'antd';

import { Tasks } from '../api/tasks.js';

import Task from './Task.js';

// App component - represents the whole app
export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
      gps: { latitude: 1, longitude: 1},
    };
  }
componentWillMount() {
  console.log('componentWillMount'); this.getGPSInfo();
}
componentDidMount() {
  console.log('componentDidMount'); //this.getGPSInfo();
}
shouldComponentUpdate() {
  console.log('shouldComponentUpdate'); //this.getGPSInfo();
  return true;
}
componentDidUpdate() {
  console.log('componentDidUpdate'); //this.getGPSInfo();
}
  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    var hashTagArr = text.match(/#(.*)+/g);
    console.log(hashTagArr);
    console.log(text);
    Tasks.insert({
      text,
      createdAt: new Date(), // current time
      createdGPS: this.state.gps,
      hashTags: hashTagArr.toString(),
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
    this.getGPSInfo();
  }

  getGPSInfo() {
    var displayValue;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({gps: { latitude: position.coords.latitude, longitude: position.coords.longitude}});
      });
      //alert('hurl1');
    }
  }
  renderTasks() {
    let filteredTasks = this.props.tasks;

    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }

    return filteredTasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  render() {
    // let gps = this.getGPSInfo();
    // console.log(gps);
    return (
      <div className="container">
      <header>
        <h1>Toast it</h1>
        <h6>{this.state.gps.latitude}</h6>
        <h6>{this.state.gps.longitude}</h6>
        <label className="hide-completed">
          <input
            type="checkbox"
            readOnly
            checked={this.state.hideCompleted}
            onClick={this.toggleHideCompleted.bind(this)}
          />
          Hide Completed Tasks
        </label><br/>
        <input type="button" value="100m"/><input type="button" value="300m"/><input type="button" value="500m"/><br/>
        <input type="button" value="중고"/><input type="button" value="고백"/><input type="button" value="번개"/>
        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
          <input
            type="text"
            ref="textInput"
            placeholder="Type to add new tasks"
          />
        </form>
      </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>

    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, App);
