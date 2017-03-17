var jenkinsapi = require('jenkins-api');
 
console.log('1');
// username/password 
var jenkins = jenkinsapi.init("https://build-jenkins.wdf.sap.corp/jenkins/");
console.log('2');
//jenkins.job_info('PullReqNew.build-prototype-editors', function(err, data) {
//  console.log('3');
//  if (err){ return console.log(err); }
//  console.log(data)
  
//});
console.log('4');
jenkins.build_info('PullReqNew.build-prototype-editors', '280', function(err, data) {
  if (err){ return console.log(err); }
  console.log(data)
});
