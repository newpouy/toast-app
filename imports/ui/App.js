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
      searchConditionTags: ['non'],
      searchConditionDistance: 100,
    };
    this.searchByTag = this.searchByTag.bind(this); // by now, here, meteor's arrow function doesnt work. so do like this.
    this.searchByDistance = this.searchByDistance.bind(this); // same as above
    this.renderTasks = this.renderTasks.bind(this); // same as above
    this.reset = this.reset.bind(this);
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
    let text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    let hashTagArr = text.match(/#(.\S+)/g);
    let hashRemovedHashTagArr = []
    if(hashTagArr != null){
      hashRemovedHashTagArr = hashTagArr.map(function(el){
        return el.replace('#','');
      })
    }
    Tasks.insert({
      text,
      createdAt: new Date(), // current time
      createdGPS: this.state.gps,
      hashTags: hashRemovedHashTagArr,
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  getGps() {
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

  searchByTag (event) {
    console.log(event.target.name);
    let searchTag = event.target.name;
    switch (searchTag) {
      case 'recycle':
        this.setState({searchConditionTags: ['중고']});
        break;
      case 'proposal':
        this.setState({searchConditionTags: ['고백']});
        break;
      case 'instant':
        this.setState({searchConditionTags: ['번개']});
        break;
      default:

    }
  }

  searchByDistance (event) {
    console.log(event.target.name);
    let searchDistance = Number(event.target.name);
    this.setState({searchConditionDistance: searchDistance});
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = (lat2-lat1)* Math.PI / 180;
      var dLon = (lon2-lon1)* Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1* Math.PI / 180) * Math.cos(lat2* Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;
      return d;
  }

  reset () {
    this.setState({
      searchConditionDistance: 100,
      searchConditionTags: ['non'],
    });
  }
  renderTasks () {
    let filteredTasks = this.props.tasks;

    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    let searchConditionTags = this.state.searchConditionTags;
    if(searchConditionTags.length>0){
      for(index1 in searchConditionTags) {
        filteredTasks = filteredTasks.map(task => {
          task.distance = Math.round(1000 * this.calculateDistance(this.state.gps.latitude, this.state.gps.longitude, task.createdGPS.latitude, task.createdGPS.longitude));
          return task;
        }).filter(task => {
          let result = false;
          let hashTags = task.hashTags;
          for ( index2 in hashTags ) {
            console.log('tag', searchConditionTags[index1], hashTags[index2], task.distance, this.state.searchConditionDistance);
            if( (searchConditionTags[index1] == 'non'|| searchConditionTags[index1] == hashTags[index2])
                && task.distance<this.state.searchConditionDistance) {
              result = true;
            }
          }
          return result;
        });
      }
    }
    // filteredTasks = filteredTasks.map(task => {
    //   task.distance = this.calculateDistance(this.state.gps.latitude, this.state.gps.longitude, task.createdGPS.latitude, task.createdGPS.longitude);
    // });
    return filteredTasks.map((task) => {
      let distance = 1;
      return <Task key={task._id} task={task} distance={task.distance}/>
    });
  }

  render() {
    // let gps = this.getGPSInfo();
    // console.log(gps);
    return (
      <div className="container">
      <header>
        <h1>Toast itttt</h1>
        <h6>{this.state.gps.latitude}</h6>
        <h6>{this.state.gps.longitude}</h6>
        <label className="hide-completed">
          <input
            type="checkbox"
            readOnly
            checked={this.state.hideCompleted}
            onClick={this.getGps.bind(this)}
          />
          gps정보
        </label><br/>
        <input type="button" name="" value="reset" onClick={this.reset}/>
        <input type="button" name="1" value="1m" onClick={this.searchByDistance}/>
        <input type="button" name="3" value="3m" onClick={this.searchByDistance}/>
        <input type="button" name="5" value="5m" onClick={this.searchByDistance}/>
        <input type="button" name="10" value="10m" onClick={this.searchByDistance}/><br/>
        <input type="button" name="recycle" value="중고" onClick={this.searchByTag}/>
        <input type="button" name="proposal" value="고백" onClick={this.searchByTag}/>
        <input type="button" name="instant" value="번개" onClick={this.searchByTag}/>
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
