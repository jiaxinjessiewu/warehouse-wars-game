require("./port");
var express = require("express");
var app = express();

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
const sqlite3 = require("sqlite3").verbose();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
// will create the db if it does not exist
var db = new sqlite3.Database("db/database.db", err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

// https://expressjs.com/en/starter/static-files.html
app.use(express.static("static-content"));

app.get("/ww/api/user/:username/", function(req, res) {
  var user = req.params.username;
  // http://www.sqlitetutorial.net/sqlite-nodejs/query/
  let sql =
    "SELECT username, email, numGamesPlayed, lastLogin FROM appuser WHERE username=?; ";
  db.all(sql, [user], (err, rows) => {
    var result = {};
    result["profile"] = [];
    if (err) {
      result["error"] = err.message;
    } else {
      rows.forEach(row => {
        result["profile"].push(row);
      });
    }
    res.json(result);
  });
});

app.get("/ww/api/user/:username/highScores", function(req, res) {
  var user = req.params.username;
  // http://www.sqlitetutorial.net/sqlite-nodejs/query/
  let sql =
    "SELECT s.score FROM appuser a,scores s WHERE a.username=? AND s.username=? ORDER BY s.score DESC;";
  db.all(sql, [user, user], (err, rows) => {
    var result = {};
    result["userscore"] = [];
    if (err) {
      result["error"] = err.message;
    } else {
      rows.forEach(row => {
        result["userscore"].push(row);
      });
    }
    res.json(result);
  });
});

app.get("/ww/api/highscore/", function(req, res) {
  let sql = "SELECT * FROM scores ORDER BY score DESC LIMIT 10;";
  db.all(sql, [], (err, rows) => {
    var result = {};
    result["highscore"] = [];
    if (err) {
      result["error"] = err.message;
    } else {
      rows.forEach(row => {
        result["highscore"].push(row);
      });
    }
    res.json(result);
  });
});

app.get("/ww/api/allhighscore/", function(req, res) {
  let sql = "SELECT * FROM scores ORDER BY score DESC;";
  db.all(sql, [], (err, rows) => {
    var result = {};
    result["allhighscore"] = [];
    if (err) {
      result["error"] = err.message;
    } else {
      rows.forEach(row => {
        result["allhighscore"].push(row);
      });
    }
    res.json(result);
  });
});

app.get("/ww/api/loginuser/:username/", function(req, res) {
  var user = req.params.username;
  var password = req.query.pw;
  // http://www.sqlitetutorial.net/sqlite-nodejs/query/
  let sql = "SELECT * FROM appuser WHERE username=? AND password = ?;";
  db.get(sql, [user, password], (err, row) => {
    var result = {};

    if (err) {
      result["error"] = err.message;
    } else {
      if (row == undefined) {
        result["status"] = "unsuccessful";
      } else {
        result["status"] = "successful";
        result[user] = row["password"];
      }
    }
    res.json(result);
  });
});

app.post("/ww/api/updateuser/:userName/", function(req, res) {
  var user = req.params.userName;
  var password = req.body.pw;
  var email = req.body.email;

  // http://www.sqlitetutorial.net/sqlite-nodejs/update/
  let sql = "UPDATE appuser SET password=?, email=? WHERE username=?;";
  db.run(sql, [password, email, user], function(err) {
    var result = {};
    if (err) {
      res.status(404);
      result["error"] = err.message;
    } else {
      if (this.changes != 1) {
        result["error"] = "Not updated";
        res.status(404);
      } else {
        result[user] = "updated rows: " + this.changes;
      }
    }
    res.json(result);
  });
});

app.post("/ww/api/loginuser/:userName/", function(req, res) {
  var user = req.params.userName;
  var lastLogin = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");

  // http://www.sqlitetutorial.net/sqlite-nodejs/update/
  let sql = "UPDATE appuser SET lastLogin=? WHERE username=?;";
  db.run(sql, [lastLogin, user], function(err) {
    var result = {};
    if (err) {
      res.status(404);
      result["error"] = err.message;
    } else {
      if (this.changes != 1) {
        result["error"] = "Not updated";
        res.status(404);
      } else {
        result[user] = "updated rows: " + this.changes;
      }
    }
    res.json(result);
  });
});

app.post("/ww/api/playgame/:userName/", function(req, res) {
  var user = req.params.userName;

  // http://www.sqlitetutorial.net/sqlite-nodejs/update/
  let sql =
    "UPDATE appuser SET numGamesPlayed=numGamesPlayed+1 WHERE username=?;";
  db.run(sql, [user], function(err) {
    var result = {};
    if (err) {
      res.status(404);
      result["error"] = err.message;
    } else {
      if (this.changes != 1) {
        result["error"] = "Not updated";
        res.status(404);
      } else {
        result[user] = "updated rows: " + this.changes;
      }
    }
    console.log(JSON.stringify(result));
    res.json(result);
  });
});

app.put("/ww/api/creatuser/:username/", function(req, res) {
  var user = req.params.username;
  var password = req.body.pw;
  var email = req.body.email;
  var lastLogin = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");

  let sql =
    "INSERT INTO appuser(username, password,email,lastLogin) VALUES (?,?,?,?);";
  db.run(sql, [user, password, email, lastLogin], function(err) {
    var result = {};
    if (err) {
      result["error"] = err.message;
      result["status"] = "unsuccessful";
    } else {
      result["status"] = "successful";
      result[user] = "updated rows: " + this.changes;
    }
    console.log(JSON.stringify(result));
    res.json(result);
  });
});
app.put("/ww/api/newscore/:username/", function(req, res) {
  var user = req.params.username;
  var newscore = req.body.ns;

  let sql = "INSERT INTO scores VALUES(?,?);";
  db.run(sql, [user, newscore], function(err) {
    var result = {};
    if (err) {
      result["error"] = err.message;
      result["status"] = "unsuccessful: user got same score before";
    } else {
      result["status"] = "successful";
      result[user] = "updated score: " + newscore;
    }
    res.json(result);
  });
});

app.delete("/ww/api/delete/:username/", function(req, res) {
  var user = req.params.username;
  numberofrows = 0;
  let sql1 = "DELETE FROM appuser WHERE username=?";
  db.run(sql1, [user], function(err) {
    var result = {};
    if (err) {
      result["error"] = err.message;
      result["status"] = "unsuccessful";
    } else {
      numberofrows += this.changes;
    }
  });
  let sql2 = "DELETE FROM scores WHERE username=?";
  db.run(sql2, [user], function(err) {
    numberofrows += this.changes;
    var result = {};
    if (err) {
      result["error"] = err.message;
      result["status"] = "unsuccessful";
    } else {
      result["status"] = "successful";
      result[user] = "deleted rows: " + numberofrows;
    }
    console.log(JSON.stringify(result));
    res.json(result);
  });
});

app.listen(port, function() {
  console.log("Example app listening on port " + port);
});
function Stage(width, height, monsters, stageElementID) {
  this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
  this.player = null; // a special actor, the player
  this.playTime = 0; // Seconds played
  this.pause = false; // Holds whether the game is paused or not

  // the logical width and height of the stage
  this.monsters = monsters;
  this.width = width;
  this.height = height;

  // the element containing the visual representation of the stage
  this.stageElementID = stageElementID;

  // take a look at the value of these to understand why we capture them this way
  // an alternative would be to use 'new Image()'
  this.blankImageSrc = document.getElementById("blankImage").src;
  this.monsterImageSrc = document.getElementById("monsterImage").src;
  this.playerImageSrc = document.getElementById("playerImage").src;
  this.boxImageSrc = document.getElementById("boxImage").src;
  this.wallImageSrc = document.getElementById("wallImage").src;
}
// db.close();
