// Stage

function Stage(width, height, stageElementID) {
  this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
  this.player = null; // a special actor, the player
  this.playedTime = 0;
  this.pause = false;
  this.status = "";
  this.width = width;
  this.height = height;
  // the element containing the visual representation of the stage
  this.stageElementID = stageElementID;

  this.blankImageSrc = document.getElementById("blankImage").src;
  this.monsterImageSrc = document.getElementById("monsterImage").src;
  this.playerImageSrc = document.getElementById("playerImage").src;
  this.boxImageSrc = document.getElementById("boxImage").src;
  this.wallImageSrc = document.getElementById("wallImage").src;
}

// initialize an instance of the game
Stage.prototype.initialize = function() {
  // Create a table of blank images, give each image an ID so we can reference it later
  var s = "<table id='stageinit' cellspacing='0'>";
  var cw = Math.round(this.width / 2 - 1);
  var ch = Math.round(this.height / 2 - 1);
  for (var y = 0; y < this.height; y++) {
    s += "<tr>";
    for (var x = 0; x < this.width; x++) {
      if ((x == cw && y == ch) || false) {
        s +=
          "<td><img id='" +
          this.getStageId(x, y) +
          "' src=" +
          this.playerImageSrc +
          " style='height:25px;width:25px'/></td>";
        player = new Player(this, x, y);
        this.addActor(player);
        this.player = player;
      } else {
        var prob = Math.random();
        if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
          s +=
            "<td><img id='" +
            this.getStageId(x, y) +
            "' src=" +
            this.wallImageSrc +
            " style='height:25px;width:25px'/></td>";
          wall = new Wall(this, x, y);
          this.addActor(wall);
        } else if (prob < 0.07) {
          s +=
            "<td><img id='" +
            this.getStageId(x, y) +
            "' src=" +
            this.monsterImageSrc +
            " style='height:25px;width:25px'/></td>";
          monster = new Monster(this, x, y);
          this.addActor(monster);
        } else if (prob < 0.4) {
          s +=
            "<td><img id='" +
            this.getStageId(x, y) +
            "' src=" +
            this.boxImageSrc +
            " style='height:25px;width:25px'/></td>";
          box = new Box(this, x, y);
          this.addActor(box);
        } else {
          s +=
            "<td><img id='" +
            this.getStageId(x, y) +
            "' src=" +
            this.blankImageSrc +
            " style='height:25px;width:25px'/></td>";
        }
      }
    }
    s += "</tr>";
  }
  s += "</table>";
  document.getElementById("stage").innerHTML = s;
  this.controlUser(true);
};

// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId = function(x, y) {
  return "(" + x + "," + y + ")";
};

Stage.prototype.addActor = function(actor) {
  this.actors.push(actor);
};

Stage.prototype.getActor = function(x, y) {
  for (var i = 0; i < this.actors.length; i++) {
    if (this.actors[i].x == x && this.actors[i].y == y) {
      return this.actors[i];
    }
  }
  return null;
};

Stage.prototype.removeActor = function(actor) {
  var index = this.actors.indexOf(actor);
  document.getElementById(
    "(" + actor.x + "," + actor.y + ")"
  ).src = this.blankImageSrc;
  this.actors.splice(index, 1);
};

// Set the src of the image at stage location (x,y) to src
Stage.prototype.setImage = function(x, y, src) {
  document.getElementById(this.getStageId(x, y)).src = src;
};
Stage.prototype.getImageSrc = function(x, y) {
  return document.getElementById("(" + x + "," + y + ")").src;
};

Stage.prototype.getRandomInt = function(max, min = "0") {
  if (min == "0") {
    return Math.floor(Math.random() * max);
  } else {
    return Math.floor(Math.random() * (max - min)) + min;
  }
};

Stage.prototype.getMonsterNumber = function() {
  var total = 0;
  for (var count = 0; count < this.actors.length; count++) {
    if (this.actors[count] instanceof Monster) {
      total += 1;
    }
  }
  return total;
};

// Take one step in the animation of the game.
Stage.prototype.step = function() {
  if (this.getMonsterNumber() == 0) {
    this.status = "win";
    document.getElementById("pauseGame").innerHTML = "you win!";
    this.controlUser(false);
    insertNewScore();
  } else if (this.player == null) {
    this.controlUser(false);
    this.status = "lose";
    document.getElementById("pauseGame").innerHTML = "you lose!";
    insertNewScore();
  } else if (this.pause == false) {
    for (var i = 0; i < this.actors.length; i++) {
      this.actors[i].step();
    }
    this.playedTime++;
    document.getElementById("time").innerHTML = this.playedTime;
  }
};

Stage.prototype.pause = function() {
  this.pause = true;
  this.controlUser(false);
};

Stage.prototype.resume = function() {
  this.pause = false;
  this.controlUser(true);
};

Stage.prototype.controlUser = function(bool, pos = null) {
  if (bool == true) {
    if (pos) {
      player.move(player, pos[0], pos[1]);
    } else {
      document.getElementById("sw").onclick = function() {
        player.move(player, -1, 1);
      };
      document.getElementById("nw").onclick = function() {
        player.move(player, -1, -1);
      };
      document.getElementById("n").onclick = function() {
        player.move(player, 0, -1);
      };
      document.getElementById("ne").onclick = function() {
        player.move(player, 1, -1);
      };
      document.getElementById("se").onclick = function() {
        player.move(player, 1, 1);
      };
      document.getElementById("w").onclick = function() {
        player.move(player, -1, 0);
      };
      document.getElementById("e").onclick = function() {
        player.move(player, 1, 0);
      };

      document.getElementById("s").onclick = function() {
        player.move(player, 0, 1);
      };
    }
  } else {
    document.getElementById("ne").onclick = null;
    document.getElementById("w").onclick = null;
    document.getElementById("e").onclick = null;
    document.getElementById("sw").onclick = null;
    document.getElementById("s").onclick = null;
    document.getElementById("se").onclick = null;
    document.getElementById("nw").onclick = null;
    document.getElementById("n").onclick = null;
  }
};

// End Class Stage

Stage.prototype.getPlayTime = function() {
  return this.playedTime;
};

Stage.prototype.getStatus = function() {
  return this.status;
};

Stage.prototype.stopGame = function() {
  this.status = "lose";
};

function Player(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
}

Player.prototype.step = function() {
  return;
};

Player.prototype.move = function(asker, x, y) {
  var newx = this.x + x;
  var newy = this.y + y;

  if (asker instanceof Monster) {
    this.stage.removeActor(this.stage.player);
    this.stage.player = null;
    return true;
  } else {
    var dest = this.stage.getActor(newx, newy);
    if (dest instanceof Monster) {
      this.stage.removeActor(this.stage.player);
      this.stage.player = null;
      return false;
    } else if (dest == null || dest.move(this, x, y)) {
      this.stage.removeActor(this);
      this.x = newx;
      this.y = newy;
      this.stage.addActor(this);
      this.stage.setImage(this.x, this.y, this.stage.playerImageSrc);
      return true;
    } else {
      return false;
    }
  }
};

function Monster(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
  this.xSteps = [1, 0, -1, 1, -1, 1, 0, -1];
  this.ySteps = [1, 1, 1, 0, 0, -1, -1, -1];
}
Monster.prototype.checkDeath = function() {
  var surrounding = 0;

  for (var count = 0; count < this.xSteps.length; count++) {
    var dest = this.stage.getActor(
      this.x + this.xSteps[count],
      this.y + this.ySteps[count]
    );
    if (dest != null && !(dest instanceof Player)) {
      surrounding += 1;
    }
  }
  if (surrounding == 8) {
    return true;
  } else {
    return false;
  }
};

Monster.prototype.step = function() {
  if (this.checkDeath() == true) {
    this.stage.removeActor(this);
  } else {
    var blockElement = false;
    while (blockElement == false) {
      var randMove = this.stage.getRandomInt(8);

      var dest = this.stage.getActor(
        this.x + this.xSteps[randMove],
        this.y + this.ySteps[randMove]
      );
      if (
        !(
          dest instanceof Box ||
          dest instanceof Wall ||
          dest instanceof Monster
        )
      ) {
        this.move(this, this.xSteps[randMove], this.ySteps[randMove]);
        blockElement = true;
      }
    }
  }
};

Monster.prototype.move = function(asker, x, y) {
  if (!(asker === this)) {
    return false;
  }
  var newx = this.x + x;
  var newy = this.y + y;
  dest = this.stage.getActor(newx, newy);
  if (dest == null || dest.move(this, x, y)) {
    this.stage.removeActor(this);
    this.x = newx;
    this.y = newy;
    this.stage.addActor(this);
    this.stage.setImage(this.x, this.y, this.stage.monsterImageSrc);
    return true;
  } else {
    return false;
  }
};

function Box(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
}

Box.prototype.step = function() {
  return;
};

Box.prototype.move = function(asker, x, y) {
  var newx = this.x + x;
  var newy = this.y + y;

  dest = this.stage.getActor(newx, newy);

  if (
    (asker instanceof Player || asker instanceof Box) &&
    (dest == null || dest.move(this, x, y))
  ) {
    this.stage.removeActor(this);
    this.x = newx;
    this.y = newy;
    this.stage.addActor(this);
    this.stage.setImage(this.x, this.y, this.stage.boxImageSrc);
    return true;
  }
  return false;
};

function Wall(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
}

Wall.prototype.step = function() {
  return;
};

Wall.prototype.move = function(asker, x, y) {
  return false;
};
