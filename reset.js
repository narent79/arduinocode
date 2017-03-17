var request = require('request');
var jenkinsapi = require('jenkins-api');

var SerialPort = require('serialport');
//var port = new SerialPort('/dev/cu.usbmodem1421');
var port = new SerialPort('/dev/cu.usbserial');
var canWriteToSerial = false;

var jenkins = jenkinsapi.init("https://build-jenkins.wdf.sap.corp/jenkins/");
var userId = 'i820195';

var IN_PROGRESS = 0;
var PASS = 1;
var FAIL = 2;

//mainLoop();
//setInterval(mainLoop, 30000);

port.on('open', function() {
  canWriteToSerial = true;
  sendStatusToArduino('6');
});

port.on('error', function(err) {
  console.log('Error: ', err.message);
});

function mainLoop() {
  //var prList = getUsersOpenPullRequestIds();
  //getBuildList(prList);
  //canWriteToSerial = true;
  sendStatusToArduino('0121.1212');
}

function getUsersOpenPullRequestIds() {
  var prIds = {};
  var promise = request('https://github.wdf.sap.corp/api/v3/search/issues?q=author%3Ai820195+repo%3ANorman%2Fbuild-prototype-editors+is%3Aopen',
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

function getBuildList(prList) {
  var jobsList = [];
  var promiseList = [];
  //List of all jobs on build-prototype-editors
  jenkins.job_info('PullReqNew.build-prototype-editors', function(err, jobData) {
    if (err){ return console.log(err); }
    var numberOfJobs = jobData.builds.length;
    //iterate over all jobs and get more info on each job
    for(var j = 0; numberOfJobs > j; j++) {
      promiseList.push(getBuildInfo(jobData.builds[j].number, prList));
    }

    Promise.all(promiseList).then(processResults);
  });
}

function processResults(values) {
  var userStatusList = [];
  for (var i = 0; values.length > i; i++) {
    if (values[i]) {
      userStatusList.push(values[i]);
    }
  }

  sortList(userStatusList);
}

function sortList(userStatusList) {
  var currentValue;
  var currentValueIndex;
  var statusString = "";
  for (var order = 0; userStatusList.length > order; order++) {
    for (var k = 0; userStatusList.length > k; k++) {
      if (userStatusList[k]) {
        if (!currentValue) {
          currentValue = userStatusList[k];
        } else if (currentValue.rank > userStatusList[k].rank) {
          currentValue = userStatusList[k];
          currentValueIndex = k;
        }
      }       
    }

    statusString = statusString + currentValue.status;
    userStatusList[currentValueIndex] = null;
    currentValue = null;
  }
  sendStatusToArduino(statusString);
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

function sendStatusToArduino(statusItem) {
  console.log(statusItem);
  if (canWriteToSerial) {
    port.write(statusItem, function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written: ' + statusItem);
    });
  }
}

//port.on('open', function() {
//  canWriteToSerial = true;
//});

//port.on('error', function(err) {
//  console.log('Error: ', err.message);
//});

function JobInfoNode() {}
JobInfoNode.prototype = {
  id: null,
  status: null,
  rank: null
};
