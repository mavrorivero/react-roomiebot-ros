"use strict"
let ROSLIB = require('roslib');

class RoomiebotRos {
    
    constructor( name = 'generic', ros = null){
        console.log("ROS object created");
        this.rosStatus = false;
        this.registeredTopics = false;
        this.name = name;
        this.ros = ros;
        this.topics = {};
        this.services = {};
        this.running = false;
        this.onSystemInit = undefined;
        this.loopForever = undefined;
    }

    servicesCheck  (){
        Object.entries(this.services).map( ([key, value]) => {
            if(this.services[key].registered === false){
                console.log("Registering service:", this.services[key].name);
                //console.log('topic:', this.topics[key].topic);
                this.services[key].topic = new ROSLIB.Service({
                    ros: this.ros,
                    name: this.services[key].name,
                    serviceType: this.services[key].service,
                });
                this.services[key].registered = true;
                //console.log('topic:', this.topics[key].topic);
            }
            else{
                //console.log('Services already registered');
            }    
        } );
    }

    topicsCheck ()  {
        Object.entries(this.topics).map( ([key, value]) => {
            if(this.topics[key].registered === false){
                console.log("Registering topic:", this.topics[key].name);
                //console.log('topic:', this.topics[key].topic);
                this.topics[key].topic = new ROSLIB.Topic({
                    ros: this.ros,
                    name: this.topics[key].name,
                    messageType: this.topics[key].messageType,
                });
                this.topics[key].registered = true;
                //console.log('topic:', this.topics[key].topic);
            }

            if( this.topics[key].registered === true && 
                this.topics[key].type === "subscriber" &&
                this.topics[key].subscribed === false ){
                    console.log(`Topic '${this.topics[key].name}' subscribed`);
                    this.topics[key].topic.subscribe( (message) => {
                        //console.log(`Message from ${this.topics[key].name}:`, message)
                        this.topics[key].callback(message);
                    });
                    this.topics[key].subscribed = true;
            }
            
        } );
    }
    

    run () {
        //console.log("roomiebotRos: loop checking");
        if(this.ros === undefined){
          console.log('ROS still undefined');
        }
        
        //////// Check ros connection
        if(this.ros !== undefined){
            if(this.ros.isConnected){
                this.rosStatus = true;
            }
            else{
                this.rosStatus = false;
            }
        }
        else{
            this.rosStatus = false;
        }
        /// Register, subscribe and unsubscribe to topics
        if(this.rosStatus && !this.registeredTopics){
            console.log("roomiebotRos: Register and subscribe to topics");
            //
            //this.subscribe();
            this.registeredTopics = true;
            
            if (this.onSystemInit){
                this.onSystemInit();
            }
            //this.onSystemInit();
        }
        if(!this.rosStatus && this.registeredTopics){
            console.log("roomiebotRos: ROS connection LOSS, unsubscribe to topics");
          //this.unsubscribe();
          //this.setState({registeredTopics: false});
        }
        ////////  ROS LOOP  //////////////////////////
        if(this.rosStatus && this.registeredTopics && this.running){
          //this.loopForever();
          //console.log('loop forever');
          this.topicsCheck();
          this.servicesCheck();

          if(this.loopForever){
            this.loopForever();
          }
        }
        ///////////////////////////////////
        if (this.running){
          setTimeout(() => {
            this.run();
          }, 1000);
        }
    }

    unsubcribeAll () {
        Object.entries(this.topics).map( ([key, value]) => {

            if( this.topics[key].type === "subscriber" &&
                this.topics[key].subscribed === true ){
                    console.log(`unsubscribing topic '${this.topics[key].name}'`);
                    this.tryUnsubscribe(this.topics[key].topic);
                    this.topics[key].subscribed = false;
            }
            
        } );
    }
    spinOnce  () {
        this.topicsCheck();
        this.servicesCheck();
    }
    startRun () {
        console.log("Start run of roomiebotRos");
        this.running = true;
        this.run();
    }

    stopRun () {
        console.log("Stop run of roomiebotRos");
        this.running = false;
        this.unsubcribeAll();        
    }
    
    newPublisher (name, messageType){
        this.topics[name] = {
            name : name,
            messageType: messageType,
            topic: null,
            registered: false,
            type: "publisher",
        }
        this.topicsCheck();
    }

    newSubscriber (name, messageType, callback) {
        this.topics[name] = {
            name : name,
            messageType: messageType,
            topic: null,
            registered: false,
            type: "subscriber",
            callback: callback,
            subscribed: false,
        }
    }

    newService ( name, service) {
        this.services[name] = {
            name : name,
            service: service,
            topic: null,
            registered: false,
            type: "service",
            subscribed: false,            
        }
        this.servicesCheck();
    }

    tryUnsubscribe (topic) {
        try{
          topic.unsubscribe();
          return true;
        }
        catch(error){
          console.log("cant unsubscribe undefined topics");
          return false;
        }
    }

    

    tryPublish (topicName, msg) {
        console.log('tryPublish');
        let publish_attempt= false;
        let counter = 0;
        while(publish_attempt == false && counter < 5){
            if( this.topics[topicName] && this.topics[topicName].registered ){
                this.topics[topicName].topic.publish(msg);
                console.log('succcesfully published ',topicName)
                return true;
            }          
          this.spinOnce();
          counter ++;
        }
        console.log('could not publish ',topicName)
        return false;
    }

    tryCallService (serviceName,request, func, err_msg) {
        console.log('tryService', serviceName);
        let publish_attempt= false;
        let counter = 0;
        while(publish_attempt == false && counter < 5){
            if( this.services[serviceName] && this.services[serviceName].registered ){
                this.services[serviceName].topic.callService(
                    request, 
                    (response)=>{console.log('inisdeserv',response);func(response)}, 
                    (error)=>{ console.log(err_msg)}
                    );
                    console.log('succcesfull service call ',serviceName)
                return true;
            }          
          this.spinOnce();
          counter ++;
        }            
        console.log('could not call Service ',serviceName)
        return false;
    }

    setOnSystemInit(onSystemInit) {
        this.onSystemInit = onSystemInit;
    }

    setLoopForever (loopForever) {
        this.loopForever = loopForever;
    }

    

}

module.exports= RoomiebotRos;