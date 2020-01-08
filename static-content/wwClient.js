stage = null;
interval = null;
score = 0;
userName = "";

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
    stage.controlUser(false);
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
  if (stage.getStatus() != null && stage.getStatus() != "") {
    score = stage.getPlayTime();
    $.ajax({
      method: "PUT",
      url: "/ww/api/newscore/" + username + "/",
      data: { ns: score }
    }).done(function(data) {
      clearInterval(interval);
      interval = null;
    });
  }
}

function playGame() {
  increNumberofplay();
  setupGame();
  startGame();
  insertNewScore();
  $("#profile").show();
  $("#login").hide();
  $("#Signup").hide();
  $("#wwgame").show();
  $("#pauseGame").html("");
}

function UserProfile() {
  insertNewScore();
  clearInterval(interval);
  interval = null;
  score = 0;
  $("#Allscores").hide();
  $("#UserProfile").show();
  $("#wwgame").hide();
  $.ajax({
    method: "GET",
    url: "/ww/api/user/" + username
  }).done(function(data) {
    var profile = "";
    profile +=
      "<tr><td>Username: " + data["profile"][0].username + "</td></tr>";
    profile += "<tr><td>E-mail: " + data["profile"][0].email + "</td></tr>";
    profile +=
      "<tr><td>numGamesPlayed: " +
      data["profile"][0].numGamesPlayed +
      "</td></tr>";
    profile +=
      "<tr><td>lastLogin time: " + data["profile"][0].lastLogin + "</td></tr>";
    $("#showprof").html(profile);
  });

  $.ajax({
    method: "GET",
    url: "/ww/api/user/" + username + "/highScores"
  }).done(function(data) {
    var userscore = "";

    for (i = 0; i < data["userscore"].length; i++) {
      userscore += "<tr><td>" + data["userscore"][i].score + "</td></tr>";
    }
    if (userscore == "") {
      userscore = "No score available. play and get score!";
    }
    $("#userscore").html(userscore);
  });
}

function updateProfile() {
  var valid = true;
  var updateMsn = "";
  if (
    $("#updatepasswd").val().length > 8 ||
    $("#updatepasswd").val().length == 0
  ) {
    updateMsn = "Invalid password: maximum 8 characters";
    valid = false;
  }
  if (
    $("#update_user_name").val().length > 0 &&
    $("#update_user_name")
      .val()
      .match(/[\!\@@\#\$\%\^\&\*\(\)\+\.\,\;\:]/)
  ) {
    updateMsn = "Invalid user: only letters,numbers and underscore allowed";
    valid = false;
  }

  $("#updateMsn").html(updateMsn);
  if (valid) {
    $.ajax({
      method: "POST",
      url: "/ww/api/updateuser/" + username + "/",
      data: {
        pw: $("#updatepasswd").val(),
        email: $("#update_user_name").val()
      }
    }).done(function(data, text_status, jqXHR) {
      UserProfile();
    });
  }
}

function updateLogintime() {
  $.ajax({
    method: "POST",
    url: "/ww/api/loginuser/" + username + "/"
  }).done(function(data, text_status, jqXHR) {});
}

function login() {
  // Normally would check the server to see if the credentials checkout
  user_email = $("#logemail").val();
  username = $("#loguser").val();
  $.ajax({
    method: "GET",
    url: "/ww/api/loginuser/" + $("#loguser").val() + "/",
    data: { pw: $("#logpw").val() }
  }).done(function(data) {
    if ("error" in data) {
      console.log(data["error"]);
    } else {
      if (data["status"] == "successful") {
        updateLogintime();
        playGame();
      } else {
        var loginstatus = "Invalid Login.To sign up if you are new player";
        $("#loginstatus").html(loginstatus);
      }
    }
  });
}

function signup() {
  var valid = true;
  var registerMsn = "";

  if (
    $("#registerpasswd").val().length > 8 ||
    $("#registerpasswd").val().length == 0
  ) {
    registerMsn = "Invalid password: maximum 8 characters";
    valid = false;
  }
  if ($("#registeruser").val() == "") {
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
    $.ajax({
      method: "PUT",
      url: "/ww/api/creatuser/" + $("#registeruser").val() + "/",
      data: { pw: $("#registerpasswd").val(), email: $("#registeremail").val() }
    }).done(function(data) {
      if ("error" in data) {
        console.log(data["error"]);
        //                       console.log(data["status"]);
        var registeruser = "user already exists";
        $("#registerMsn").html(registeruser);
      } else {
        username = $("#registeruser").val();
        playGame();
      }
    });
  }
}
function increNumberofplay() {
  $.ajax({
    method: "POST",
    url: "/ww/api/playgame/" + username + "/"
  }).done(function(data, text_status, jqXHR) {});
}

function allhighScore() {
  insertNewScore();
  $("#wwgame").hide();
  $("#UserProfile").hide();
  $("#Allscores").show();
  $.ajax({
    method: "GET",
    url: "/ww/api/allhighscore/"
  }).done(function(data) {
    var scores = "";
    for (i = 0; i < data["allhighscore"].length; i++) {
      scores +=
        "<tr><td>" +
        data["allhighscore"][i].username +
        ": </td><td> " +
        data["allhighscore"][i].score +
        "</td></tr>";
    }
    $("#showScores").html(scores);
  });
}

function deleteAccount() {
  $.ajax({
    method: "DELETE",
    url: "ww/api/delete/" + username
  }).done(function(data) {
    logout();
  });
}

function init() {
  $("#login").show();
  $("#Signup").hide();
  $("#wwgame").hide();
  $("#UserProfile").hide();
  $("#Allscores").hide();
  $("#profile").hide();
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
