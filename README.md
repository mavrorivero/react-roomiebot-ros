# How to use
Make a js program which will act as a Node inside your React App. there you will need to set a name for the node and pass a ros object from the Roslib library.

Subscribers:
Publishers:
Services:
Best Practices:
# Tutorial
	npx create-react-app ros-test

	$npm install --save roslib

	$npm install --save react-roomiebot-ros

	$npm install --save react-router-dom

	$npm install --save history

	$npm start

Go to **index.js**
and write this code:

	import React from 'react';

	import ReactDOM from 'react-dom';

	import { Router, Switch, Route } from "react-router-dom";

	import './index.css';

	import history from './history';

	import {vars, mode} from './vars';

	import App from './App';

	import reportWebVitals from './reportWebVitals';

	import Home from './components/Home/Home';

	//// ROS

	let ROSLIB = require('roslib');
	
	let rosStatus=0;

	let ROS_URL = vars[mode].rosUrl;

	//Se realiza la conexion a ROS

	let ros = new ROSLIB.Ros({

	url : ROS_URL

	});

	  

	//Cuando se conecte a ROS

	ros.on('connection', function() {

	//console.log('Connected to websocket server.');

	rosStatus=1;

	});

	//Cuando exista un error

	ros.on('error', function(error) {

	//console.log('Error connecting to websocket server: ', error);

	reconnectRos ();

	});

	//Cuando se cierre la conexion

	ros.on('close', function() {

	//console.log('Connection to websocket server closed.');

	reconnectRos ();

	});

	function reconnectRos () {
	if(rosStatus === 0){
	//console.log("Connecting to ros");
	rosStatus=2;
	}

	if(rosStatus === 1){
	rosStatus=2;
	//console.log("Reconnecting to ros");
	}

	if(rosStatus === 2){
	rosStatus=3;
	setTimeout(()=>{
	rosStatus=1;
	//console.log("Reconnecting ...");
	ros.close();
	ros.connect(ROS_URL);
	},3000);
	}
	};

	ReactDOM.render(
	<Router  history={history}>
	<Switch>
	<Route  exact  path="/"  component={()=><Home  ros={ros}></Home>}/>
	</Switch>
	{/* <App /> */}
	</Router>,

	document.getElementById('root')
	);
	// If you want to start measuring performance in your app, pass a function
	// to log results (for example: reportWebVitals(console.log))
	// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
	reportWebVitals();`


Create a new file called **history.jsx** and set this code:
	
	import { createBrowserHistory as history} from 'history';

	export default history();

  

Create another file called **vars.jsx** and add this code:

	  

	export const mode = 'dev'
	export const vars = {
	prod: {
	rosUrl: "ws://172.17.0.1:8081",
	},
	dev: {
	rosUrl: "ws://172.17.0.1:8081"
	},
	}

Create a new folder in **src** named **components**, inside it another one called **Home**.
Then create three files: **Home.jsx**, **Home-context.jsx**, and **HomeNode.jsx**
 
## Home-context.js

	import React from "react";

	export const status =

	{

	//// ROSLIB OBJECT ////

	rbotRos: null,

	//// TOPICS MESSAGES ////

	///FRONT VARIABLES/////

	attributes: {

	a: 0.0,

	b: 0.0,

	sum: 0.0,

	text: ""

	},

	setState: () => {}

	}

	export const HomeContext = React.createContext(status);

  

## HomeNode.jsx

	import React, { Component } from "react";

	import {status, HomeContext} from './Home-context';

	let RoomiebotRos = require('react-roomiebot-ros');

	  

	class HomeNode extends Component {

	constructor(props){

	super(props)

	this.state = status;

	}

	  

	yyy_callback = (message) => {

	console.log("callback from yyy in home:", message);

	status.attributes.text = message.data;

	}

	onSystemInit_callback = () =>{

	console.log("Conectado a ROS");

	}

	loopForever_callback = () => {

	//console.log("LOOP");

	}

	componentDidMount = () => {

	document.title = 'Home'

	console.log("Builded on 2020-11-26");

	//const myClass = new RoomiebotRosDos('rosHome',this.props.ros);

	this.state.rbotRos = new RoomiebotRos('rosHome',this.props.ros);

	this.state.rbotRos.setOnSystemInit(this.onSystemInit_callback);

	this.state.rbotRos.setLoopForever(this.loopForever_callback);

	this.state.rbotRos.startRun();

	console.log("new build");

	console.log(this.state.rbotRos);

	////////////////////////////////////////////////////////////////

	//////// SUBSCRIBERS ////////

	////////////////////////////////////////////////////////////////

	this.state.rbotRos.newSubscriber('/yyy', 'std_msgs/String', this.yyy_callback);

	////////////////////////////////////////////////////////////////

	//////// PUBLISHERS ////////

	////////////////////////////////////////////////////////////////

	this.state.rbotRos.newPublisher('/zzz', 'std_msgs/String');

	////////////////////////////////////////////////////////////////

	//////// SERVICES ////////

	////////////////////////////////////////////////////////////////

	  

	this._ismounted = true;

	  

	}

	componentWillUnmount = () => {

	this._ismounted = false;

	this.state.rbotRos.stopRun();

	}

	render(){

	return(

	<React.Fragment>

	{this.props.children}

	</React.Fragment>

	)

	};

	}

	HomeNode.contextType = HomeContext;

	export default HomeNode;

  
  

## Home.jsx	  

	import React, { Component } from "react";

	import logo from '../../logo.svg';

	import '../../App.css';

	import {status, HomeContext} from './Home-context'

	import HomeNode from './HomeNode'

	  

	class Home extends Component {

	constructor(props){

	super(props)

	this.state = status;

	}

	componentDidMount(){

	console.log(`homeNew state`);

	console.log(this.state);

	this.intervalId = setInterval(this.fetchData, 5000);

	}

	  

	fetchData = () =>{

	let texting = status.attributes.text;

	console.log('texting: ',texting)

	this.setState(status)

	}

	  

	componentWillUnmount = () => {

	this._ismounted = false;

	this.state.rbotRos.stopRun();

	}

	  

	handleClick() {

	this.state.rbotRos.tryPublish('/zzz',{data:"saludos"});

	}

	render() {

	return (

	<HomeContext.Provider value = {this.state}>

	<HomeNode ros={this.props.ros} >

	<div>

	<header className="App-header">

	<img src={logo} className="App-logo" alt="logo" />

	<p>

	Edit <code>src/App.js</code> and save to reload.

	</p>

	{this.state.attributes.text}

	<button onClick={() => this.handleClick()}>

	Click me

	</button>

	</header>

	</div>

	</HomeNode>

	</HomeContext.Provider>

	)

	}

	}
	export default Home;

## Testing code:

Now that you are ready to test your front end react app with ROS; lets start rosbidge server and test th topics publishing and subscribing:

	$roslaunch rosbridge_server rosbridge_websocket.launch 

Try to send something to yoour front with this command:

	$rostopic pub -1 /yyy std_msgs/String "data: 'roomiebotRos'"

Now Use the click Button in the app to send something over /zzz topic, you can listen to it with:

	$rostopic echo /zzz

## Using services:

Next step is to use the services with the React App. Lets add this code in the render method in **Home.js**:

 	....
	 <form onSubmit={this.handleSubmit}>        
        <label>
          A:
        <input type="text" name ="a" onChange={this.handleChangeA} /> 
        </label>
        <label>
          B:
        <input type="text" name ="b" onChange={this.handleChangeB} /> 
        </label>
        <input type="submit" value="Submit" />
      </form>
      Suma: 
      {this.state.attributes.sum}
	...

Here we added three functions to handle the events, handleChangeA and handleChangeB, there, we will send the value from the textbox to the context attributes a and b:

	handleChangeA = (event) =>{
      let form = event.target.value;
      this.state.attributes.a= parseInt(form)
      console.log('handleChange: ',form)
      this.setState(status)
    }
    handleChangeB = (event) =>{
    let form = event.target.value;
    this.state.attributes.b= parseInt(form)
    console.log('handleChange: ',form)
    this.setState(status)
    }

Now, the third function added, was the handleOnsubmit function, in which we are going to call the classic AddtwoInts service from the ros tutorials:

	...
	handleSubmit = (event) =>{
      alert('A name was submitted: ' + this.state.attributes.a+ '+'+ this.state.attributes.b);
      let request = new ROSLIB.ServiceRequest({
        a : this.state.attributes.a,
        b : this.state.attributes.b
      });
      this.state.rbotRos.tryCallService('/add_two_ints',request,
      (response)=>{
        console.log('response', response.sum);
        this.state.attributes.sum= response.sum 
        }
        );
      event.preventDefault();
      this.setState(status)
    }
	...

And in the **HomeNode.jsx** script lets add the NewService declaration of the service:

		...
        ////////        SERVICES                              ////////
        ////////////////////////////////////////////////////////////////
        this.state.rbotRos.newService('/add_two_ints', 'rospy_tutorials/AddTwoInts');
		...

So now you have two textboxes where you must write integer values and when you Click on the Submit button it will call the rosservice, assign the response to the status.attributes.sum var in the home-context and render this value just below the textboxes.

Oh, I forgot, you havent launch the AddTwoInts Server in ROS, just type this:

	$rosrun rospy_tutorials add_two_ints_server