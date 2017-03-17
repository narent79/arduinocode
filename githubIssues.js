var request = require('request');
var jenkinsapi = require('jenkins-api');

var SerialPort = require('serialport');
//var port = new SerialPort('/dev/cu.usbmodem1421');
var port = new SerialPort('/dev/cu.usbserial');
var canWriteToSerial = false;

var jenkins = jenkinsapi.init("https://build-jenkins.wdf.sap.corp/jenkins/");
var userId = 'I067324';

var IN_PROGRESS = 0;
var PASS = 1;
var FAIL = 2;

port.on('open', function() {
  canWriteToSerial = true;
  mainLoop();
  setInterval(mainLoop, 30000);
});

port.on('error', function(err) {
  console.log('Error: ', err.message);
});


function sendStatusToArduino(statusItem) {
  if (canWriteToSerial) {
    port.write(statusItem, function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written: ' + statusItem);
    });
  }
}

function mainLoop() {
  var statusString = '';
  var prList = getUsersOpenPullRequestIds();
  getBuildStatusList(prList, 'PullReqNew.build-prototype-editors').then(function(statusList) {
    console.log(statusList);
    for (var i = 0; i < statusList.length; i++) {
      statusString = statusString + statusList[i].status;
    }

    // if (statusString.length === 0) {
    //   statusString = '0';
    // }
    
    sendStatusToArduino(statusString);
  });
}

//Return list of open pull request ids
function getUsersOpenPullRequestIds() {
  var prIds = {};
  //ignore ssl cert problems
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  var promise = request('https://github.wdf.sap.corp/api/v3/search/issues?q=author%3A' + userId + '+repo%3ANorman%2Fbuild-prototype-editors+is%3Aopen',
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);

      for(var i=0; json.items.length > i; i++) {
        prIds[json.items[i].number] = json.items[i].number;
      }
    }
  });

  return prIds;
}

function getBuildStatusList(prList, jenkinsJobName) {
  var jobsList = [];
  var promiseList = [];
  //List of all jobs on build-prototype-editors
  return new Promise(function(resolve, reject) {
    jenkins.job_info('PullReqNew.build-prototype-editors', function(err, jobData) {
      if (err){ return console.log(err); }
      var numberOfJobs = jobData.builds.length;
      //iterate over all jobs and get more info on each job
      for(var j = 0; numberOfJobs > j; j++) {
        promiseList.push(getBuildInfo(jobData.builds[j].number, prList));
      }

      Promise.all(promiseList).then(function(values) {
        resolve(processResults(values));
      });
    });
  });
}

function processResults(values) {
  var userStatusList = [];
  for (var i = 0; values.length > i; i++) {
    if (values[i]) {
      userStatusList.push(values[i]);
    }
  }

  userStatusList = userStatusList.sort(keySort('rank', false));

  return removeOlderDuplicates(userStatusList);
}

function keySort(key, desc) {
  return function(a,b){
   return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
  }
}

function removeOlderDuplicates(userStatusList) {
  var alreadyAdded = {};
  var newUserStatusList = [];

  for (var i = userStatusList.length - 1; i >= 0; i--) {
    if (!alreadyAdded[userStatusList[i].id]) {
      alreadyAdded[userStatusList[i].id] = true;
      newUserStatusList.push(userStatusList[i]);
    }
  }
  return newUserStatusList;
}

function getBuildInfo(buildNumber, prList) {
  //get job information
  return new Promise(function(resolve, reject) {
    jenkins.build_info('PullReqNew.build-prototype-editors', buildNumber, function(err, buildData) {
      if (err) {
        reject(err);
        return console.log(err);
      }

      if (buildData && buildData.description) {
        //extract github id out of job description
        var descriptionParts = buildData.description.match('github.wdf.sap.corp/Norman/build-prototype-editors/pull/(.*)"');

        if (descriptionParts && descriptionParts[1] && prList[descriptionParts[1]]) {
          var newNode = new JobInfoNode();
          newNode.rank = buildData.queueId;
          newNode.id = descriptionParts[1];

          if (buildData.building) {
            newNode.status = IN_PROGRESS;
          } else {
            newNode.status = buildData.result === 'FAILURE' ? FAIL : PASS;
          }
          resolve(newNode);
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

function JobInfoNode() {}

JobInfoNode.prototype = {
  id: null,
  status: null,
  rank: null
};
