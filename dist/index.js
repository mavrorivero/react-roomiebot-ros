"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ROSLIB = require('roslib');

var RoomiebotRos = /*#__PURE__*/function () {
  function RoomiebotRos() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'generic';
    var ros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, RoomiebotRos);

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

  _createClass(RoomiebotRos, [{
    key: "servicesCheck",
    value: function servicesCheck() {
      var _this = this;

      Object.entries(this.services).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        if (_this.services[key].registered === false) {
          console.log("Registering service:", _this.services[key].name); //console.log('topic:', this.topics[key].topic);

          _this.services[key].topic = new ROSLIB.Service({
            ros: _this.ros,
            name: _this.services[key].name,
            serviceType: _this.services[key].service
          });
          _this.services[key].registered = true; //console.log('topic:', this.topics[key].topic);
        } else {//console.log('Services already registered');
          }
      });
    }
  }, {
    key: "topicsCheck",
    value: function topicsCheck() {
      var _this2 = this;

      Object.entries(this.topics).map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            value = _ref4[1];

        if (_this2.topics[key].registered === false) {
          console.log("Registering topic:", _this2.topics[key].name); //console.log('topic:', this.topics[key].topic);

          _this2.topics[key].topic = new ROSLIB.Topic({
            ros: _this2.ros,
            name: _this2.topics[key].name,
            messageType: _this2.topics[key].messageType
          });
          _this2.topics[key].registered = true; //console.log('topic:', this.topics[key].topic);
        }

        if (_this2.topics[key].registered === true && _this2.topics[key].type === "subscriber" && _this2.topics[key].subscribed === false) {
          console.log("Topic '".concat(_this2.topics[key].name, "' subscribed"));

          _this2.topics[key].topic.subscribe(function (message) {
            //console.log(`Message from ${this.topics[key].name}:`, message)
            _this2.topics[key].callback(message);
          });

          _this2.topics[key].subscribed = true;
        }
      });
    }
  }, {
    key: "run",
    value: function run() {
      var _this3 = this;

      //console.log("roomiebotRos: loop checking");
      if (this.ros === undefined) {
        console.log('ROS still undefined');
      } //////// Check ros connection


      if (this.ros !== undefined) {
        if (this.ros.isConnected) {
          this.rosStatus = true;
        } else {
          this.rosStatus = false;
        }
      } else {
        this.rosStatus = false;
      } /// Register, subscribe and unsubscribe to topics


      if (this.rosStatus && !this.registeredTopics) {
        console.log("roomiebotRos: Register and subscribe to topics"); //
        //this.subscribe();

        this.registeredTopics = true;

        if (this.onSystemInit) {
          this.onSystemInit();
        } //this.onSystemInit();

      }

      if (!this.rosStatus && this.registeredTopics) {
        console.log("roomiebotRos: ROS connection LOSS, unsubscribe to topics"); //this.unsubscribe();
        //this.setState({registeredTopics: false});
      } ////////  ROS LOOP  //////////////////////////


      if (this.rosStatus && this.registeredTopics && this.running) {
        //this.loopForever();
        //console.log('loop forever');
        this.topicsCheck();
        this.servicesCheck();

        if (this.loopForever) {
          this.loopForever();
        }
      } ///////////////////////////////////


      if (this.running) {
        setTimeout(function () {
          _this3.run();
        }, 1000);
      }
    }
  }, {
    key: "unsubcribeAll",
    value: function unsubcribeAll() {
      var _this4 = this;

      Object.entries(this.topics).map(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            key = _ref6[0],
            value = _ref6[1];

        if (_this4.topics[key].type === "subscriber" && _this4.topics[key].subscribed === true) {
          console.log("unsubscribing topic '".concat(_this4.topics[key].name, "'"));

          _this4.tryUnsubscribe(_this4.topics[key].topic);

          _this4.topics[key].subscribed = false;
        }
      });
    }
  }, {
    key: "spinOnce",
    value: function spinOnce() {
      this.topicsCheck();
      this.servicesCheck();
    }
  }, {
    key: "startRun",
    value: function startRun() {
      console.log("Start run of roomiebotRos");
      this.running = true;
      this.run();
    }
  }, {
    key: "stopRun",
    value: function stopRun() {
      console.log("Stop run of roomiebotRos");
      this.running = false;
      this.unsubcribeAll();
    }
  }, {
    key: "newPublisher",
    value: function newPublisher(name, messageType) {
      this.topics[name] = {
        name: name,
        messageType: messageType,
        topic: null,
        registered: false,
        type: "publisher"
      };
      this.topicsCheck();
    }
  }, {
    key: "newSubscriber",
    value: function newSubscriber(name, messageType, callback) {
      this.topics[name] = {
        name: name,
        messageType: messageType,
        topic: null,
        registered: false,
        type: "subscriber",
        callback: callback,
        subscribed: false
      };
    }
  }, {
    key: "newService",
    value: function newService(name, service) {
      this.services[name] = {
        name: name,
        service: service,
        topic: null,
        registered: false,
        type: "service",
        subscribed: false
      };
      this.servicesCheck();
    }
  }, {
    key: "tryUnsubscribe",
    value: function tryUnsubscribe(topic) {
      try {
        topic.unsubscribe();
        return true;
      } catch (error) {
        console.log("cant unsubscribe undefined topics");
        return false;
      }
    }
  }, {
    key: "tryPublish",
    value: function tryPublish(topicName, msg) {
      console.log('tryPublish');
      var publish_attempt = false;
      var counter = 0;

      while (publish_attempt == false && counter < 5) {
        if (this.topics[topicName] && this.topics[topicName].registered) {
          this.topics[topicName].topic.publish(msg);
          console.log('succcesfully published ', topicName);
          return true;
        }

        this.spinOnce();
        counter++;
      }

      console.log('could not publish ', topicName);
      return false;
    }
  }, {
    key: "tryCallService",
    value: function tryCallService(serviceName, request, func, err_msg) {
      console.log('tryService', serviceName);
      var publish_attempt = false;
      var counter = 0;

      while (publish_attempt == false && counter < 5) {
        if (this.services[serviceName] && this.services[serviceName].registered) {
          this.services[serviceName].topic.callService(request, function (response) {
            console.log('inisdeserv', response);
            func(response);
          }, function (error) {
            console.log(err_msg);
          });
          console.log('succcesfull service call ', serviceName);
          return true;
        }

        this.spinOnce();
        counter++;
      }

      console.log('could not call Service ', serviceName);
      return false;
    }
  }, {
    key: "setOnSystemInit",
    value: function setOnSystemInit(onSystemInit) {
      this.onSystemInit = onSystemInit;
    }
  }, {
    key: "setLoopForever",
    value: function setLoopForever(loopForever) {
      this.loopForever = loopForever;
    }
  }]);

  return RoomiebotRos;
}();

module.exports = RoomiebotRos;