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
  } else if (aitype === "highestmerge") {
    this.ai = new HighestMerge();
  } else if (aitype === "mostmerges"){
    this.ai = new MostMerges();
  } else if (aitype === "corners"){
    this.ai = new Corners();
  } else if (aitype === "smoothness") {
    this.ai = new Smoothness();
  } else if (aitype === "scoring") {
    this.ai = new Scoring();
  } else if (aitype === "stacks") {
    this.ai = new Stacks();
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