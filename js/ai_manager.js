function AIManager(gameManager){
  this.aiSelector = document.querySelector(".ai-select");
  this.aiThread       = null;
  this.gameManager    = gameManager;
  this.lastMoveResult = true;
  this.numberOfGamesPlayed = 0;
  this.numberOfGamesPlayedView = document.querySelector("#current-game-number");
  this.updateAI();
}

AIManager.prototype.updateAI = function(){
  if (this.aiThread !== null) {
    clearTimeout(this.aiThread);
  }
  this.numberOfGamesPlayed = 0;
  this.aiSelector = document.querySelector(".ai-select");
  var aitype = this.aiSelector.options[this.aiSelector.selectedIndex].value;
  console.log("Loading " + aitype);
  this.ai = null;
  if (aitype === "random") {
    this.ai = new RandomAI();
  } else if (aitype === "lucasai") {
    this.ai = new LucasAI();
  } else if (aitype === "nnlucasai") {
    this.ai = new NNLucasAI();
  } else if (aitype === "caseyai") {
    this.ai = new CaseyAI();
  }
  var self = this;
  //this.aiThread = setTimeout(this.playGame.bind(this), AI_WAIT_TIME);
};

AIManager.prototype.startAI = function(){
  //console.log("Start AI called");
  this.updateAI();
  this.aiThread = setTimeout(this.playGame.bind(this), AI_WAIT_TIME);
};

AIManager.prototype.playGame = function(){
  this.numberOfGamesPlayedView.innerHTML = "current game number: " + this.numberOfGamesPlayed;
  if (this.numberOfGamesPlayed >= AI_NUMBER_OF_GAMES) clearTimeout(this.aiThread);
  for (var i = 0; i < AI_SKIP_MOVE_DELAY; i++) {
    if (this.gameManager.over) {
      //console.log("Game number: " + (this.numberOfGamesPlayed + 1) + " / " + AI_NUMBER_OF_GAMES);
      this.gameManager.reportStats(this.numberOfGamesPlayed);
      this.gameManager.resetStats();
      this.numberOfGamesPlayed++;
      if (this.numberOfGamesPlayed < AI_NUMBER_OF_GAMES) {
        this.gameManager.restart();
      } else {
        break;
      }
    } else {
      this.lastMoveResult = this.gameManager.nextMoveAI(this.lastMoveResult);
      //this.aiThread = setTimeout(this.playGame.bind(this), AI_WAIT_TIME);
    }
  }
  if (this.numberOfGamesPlayed >= AI_NUMBER_OF_GAMES) {
    clearTimeout(this.aiThread);
    this.gameManager.saveReport();
    this.gameManager.resetReport();
  } else {
    this.aiThread = setTimeout(this.playGame.bind(this), AI_WAIT_TIME);
  }
};

AIManager.prototype.queryAI = function(grid, lastGrid, moved){
  return this.ai.chooseNextMove(grid, lastGrid, moved);
};