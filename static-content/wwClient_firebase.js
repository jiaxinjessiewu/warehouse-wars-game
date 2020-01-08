stage = null;
interval = null;
score = 0;
username = "";
user_email = "";
let appuser_data;
let game_history_data;
let auth;

window.onbeforeunload = function() {
  return "Are you sure you want to leave?";
};
function setupGame() {
  stage = new Stage(20, 20, "stage");
  stage.initialize();
}
function startGame() {
  if (interval != null) {
    clearInterval(interval);
  }
  interval = setInterval(function() {
    stage.step();
  }, 1000);
}
function pauseGame(bool) {
  if (bool == true) {
    stage.pause();
    clearInterval(interval);
  } else {
    stage.controlUser(true);
    startGame();
  }
}

function logout() {
  if (confirm("Are you sure you want to logout ?")) {
    insertNewScore();
    username = "";
    clearInterval(interval);
    interval = null;
    score = 0;
    init();
  }
}

function insertNewScore() {
  var stage_status = stage.getStatus();
  if (stage_status != null && stage_status != "") {
    score = stage.getPlayTime();
    clearInterval(interval);
    interval = null;
    game_history_data.add({
      email: user_email,
      name: username,
      score: score,
      time: new Date().getTime()
    });
  }
}

function playGame() {
  setupGame();
  startGame();
  $("#profile").show();
  $("#login").hide();
  $("#Signup").hide();
  $("#wwgame").show();
  $("#pauseGame").html("");
}
function UserProfile() {
  clearInterval(interval);
  interval = null;
  score = 0;
  $("#Allscores").hide();
  $("#UserProfile").show();
  $("#wwgame").hide();

  appuser_data
    .where("email", "==", user_email)
    .get()
    .then(user => {
      var profile = "<table>";

      user.docs.forEach(function(doc) {
        profile += "<tr><td>Username</td><td>" + doc.data().name + "</td></tr>";
        profile += "<tr><td>E-mail</td><td>" + doc.data().email + "</td></tr>";
        profile +=
          "<tr><td>Last Login Time</td><td>" +
          timeConverter(doc.data().last_login) +
          "</td></tr>";
      });
      profile += "</table>";
      $("#showprof").html(profile);
    });

  game_history_data
    .where("email", "==", user_email)
    .get()
    .then(scores => {
      var user_scores = "<table><tr><th>Played Time</th><th>Score</th></tr>";
      scores.docs.forEach(function(doc) {
        user_scores +=
          "<tr><td>" +
          timeConverter(doc.data().time) +
          "</td><td>" +
          doc.data().score +
          "</td></tr>";
      });
      user_scores += "</table>";
      $("#user_scores").html(user_scores);
    });
}

function timeConverter(timestamp) {
  var a = new Date(timestamp);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
}

function updateProfile() {
  var valid = true;
  var updateMsn = "";
  var new_user_name = "";
  var new_email = "";
  if ($("#updatepasswd").val().length > 8) {
    updateMsn = "Invalid password: maximum 8 characters";
    valid = false;
  } else {
    new_email = $("#updatepasswd").val();
  }
  if (
    $("#update_user_name").val().length > 0 &&
    $("#update_user_name")
      .val()
      .match(/[\!\@@\#\$\%\^\&\*\(\)\+\.\,\;\:]/)
  ) {
    updateMsn = "Invalid user: only letters,numbers and underscore allowed";
    valid = false;
  } else {
    new_user_name = $("#update_user_name").val();
  }
  $("#updateMsn").html(updateMsn);
  if (valid) {
    appuser_data
      .where("email", "==", user_email)
      .get()
      .then(user => {
        user.forEach(function(doc) {
          // Build doc ref from doc.id
          if (new_user_name.length > 0) {
            appuser_data.doc(doc.id).update({ name: new_user_name });
          }
          if (new_email > 0) {
            appuser_data.doc(doc.id).update({ password: new_email });
          }
          UserProfile();
        });
      });
  }
}
function updateLogintime() {
  appuser_data
    .where("email", "==", user_email)
    .get()
    .then(user => {
      user.forEach(function(doc) {
        // Build doc ref from doc.id
        appuser_data.doc(doc.id).update({ last_login: new Date().getTime() });
      });
    });
}
function login() {
  user_email = $("#logemail").val();
  appuser_data
    .where("email", "==", $("#logemail").val())
    .where("password", "==", $("#logpw").val())
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        var loginstatus = "Invalid Login.To sign up if you are new player";
        $("#loginstatus").html(loginstatus);
      } else {
        const auth = firebase.auth();
        const login_promise = auth.signInWithEmailAndPassword(
          $("#logemail").val(),
          $("#logpw").val()
        );

        login_promise.catch(function(error) {
          console.log("login auth error: ", error);
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        });
        updateLogintime();
        playGame();
        snapshot.docs.forEach(doc => {
          username = doc.data().name;
        });
      }
    });
}

function signup() {
  var valid = true;
  var registerMsn = "";
  var register_user = $("#registeruser").val();
  var register_email = $("#registeremail").val();
  var resigter_pw = $("#registerpasswd").val();

  if (resigter_pw.length <= 6) {
    registerMsn = "Invalid password: minimum 6 characters";
    valid = false;
  }
  if (register_user == "") {
    registerMsn = "User name can not be empty";
    valid = false;
  } else if (
    $("#registeruser")
      .val()
      .match(/[\!\@@\#\$\%\^\&\*\(\)\+\.\,\;\:]/)
  ) {
    registerMsn = "Invalid user: only letters,numbers and underscore allowed";
    valid = false;
  }

  $("#registerMsn").html(registerMsn);
  if (valid) {
    auth = firebase.auth();
    const signup_promise = auth.createUserWithEmailAndPassword(
      register_email,
      resigter_pw
    );

    signup_promise
      .then(result => {
        if (result.user) {
          username = register_user;
          user_email = register_email;
          appuser_data.add({
            name: register_user,
            email: register_email,
            password: resigter_pw,
            last_login: new Date().getTime()
          });
          playGame();
        }
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == "auth/email-already-in-use") {
          $("#registerMsn").html(errorMessage);
        }
      });
  }
}

function highScore() {
  game_history_data
    .orderBy("score", "desc")
    .limit(5)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        var scores = "<table>";
        snapshot.docs.forEach(history => {
          scores +=
            "<tr><td>" +
            history.data().name +
            "</td><td> " +
            history.data().score +
            "</td></tr>";
        });
        scores += "</table>";
        $("#scores").html(scores);
      }
    });
}

function allhighScore() {
  //   insertNewScore();
  clearInterval(interval);
  interval = null;
  score = 0;
  $("#wwgame").hide();
  $("#UserProfile").hide();
  $("#Allscores").show();

  game_history_data
    .orderBy("score", "desc")
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        var scores = "<table><tr><th>User Name</th><th>Score</th></tr>";
        snapshot.docs.forEach(history => {
          scores +=
            "<tr><td>" +
            history.data().name +
            " </td><td> " +
            history.data().score +
            "</td></tr>";
        });
        score += "</table>";
        $("#showScores").html(scores);
      }
    });
}

function deleteAccount() {
  appuser_data
    .where("email", "==", user_email)
    .get()
    .then(user => {
      user.docs.forEach(function(doc) {
        doc.ref.delete();
      });
    });
}

function init() {
  appuser_data = database.collection("appuser");
  game_history_data = database.collection("game_history");
  $("#login").show();
  $("#Signup").hide();
  $("#wwgame").hide();
  $("#UserProfile").hide();
  $("#Allscores").hide();
  $("#profile").hide();
  highScore();
}

function readKeyboard(keypress) {
  if (interval != null) {
    var x = 0;
    var y = 0;
    var code = keypress.which || keypress.keycode;
    var valid_code = true;
    if (code == 90) {
      x = -1;
      y = 1;
    } else if (code == 88 || code == 38) {
      y = 1;
    } else if (code == 67) {
      x = 1;
      y = 1;
    } else if (code == 65 || code == 37) {
      x = -1;
    } else if (code == 68 || code == 39) {
      x = 1;
    } else if (code == 81) {
      x = -1;
      y = -1;
    } else if (code == 87 || code == 40) {
      y = -1;
    } else if (code == 69) {
      x = 1;
      y = -1;
    } else {
      valid_code = false;
    }
    if (valid_code) {
      var pos = [x, y];
      stage.controlUser(true, pos);
    }
  }
}

function keyBoardControl() {
  document.addEventListener("keydown", function(keypress) {
    readKeyboard(keypress);
  });
}
keyBoardControl();
$(function() {
  // Setup all events here and display the appropriate UI
  init();
  $("#loginSubmit").on("click", function() {
    login();
  });
  $("#newuser").on("click", function() {
    $("#login").hide();
    $("#Signup").show();
  });
  $("#sublogin").on("click", function() {
    $("#login").show();
    $("#Signup").hide();
  });
  $("#signup").click(function() {
    signup();
  });

  $("#userProf").on("click", function() {
    UserProfile();
  });
  $("#scoreinfo").on("click", function() {
    clearInterval(interval);
    interval = null;
    score = 0;
    allhighScore();
  });
  $("#main").on("click", function() {
    $("#Allscores").hide();
    $("#UserProfile").hide();
    playGame();
  });
  $("#updatebtn").on("click", function() {
    updateProfile();
  });

  $("#btnPause").on("click", function() {
    pauseGame(true);
    document.getElementById("pauseGame").innerHTML = "Paused";
  });
  $("#btnContin").on("click", function() {
    pauseGame(false);
    document.getElementById("pauseGame").innerHTML = "";
  });
  $("#btndelete").on("click", function() {
    deleteAccount();
    username = "";
    clearInterval(interval);
    interval = null;
    score = 0;
    init();
  });
});
