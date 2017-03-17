var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "github.wdf.sap.corp", // should be api.github.com for GitHub
    pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36" // GitHub is happy with a unique user agent
    },
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

//github.authenticate({
//    type: "basic",
//    username: 'nicholas.arent@sap.com',
//    password: ''
//});

github.pullRequests.getAll({owner: 'Norman', repo: 'build-prototype-editors'}, function(err, res) {
    console.log(err, res);    
});
