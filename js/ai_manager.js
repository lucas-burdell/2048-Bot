function AIManager(gameManager){
  this.aiSelector = document.querySelector(".ai-select");
  this.aiThread       = null;
  this.gameManager    = gameManager;
  this.lastMoveResult = true;
  this.numberOfGamesPlayed = 0;
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
  if (this.gameManager.over) {
    if (this.numberOfGamesPlayed < AI_NUMBER_OF_GAMES) {
      this.numberOfGamesPlayed++;
      this.gameManager.restart();
    } else {
      clearInterval(self.aiThread);
    }
  } else {
    this.lastMoveResult = this.gameManager.nextMoveAI(this.lastMoveResult);
  }
  this.aiThread = setTimeout(this.playGame.bind(this), AI_WAIT_TIME);
};

AIManager.prototype.queryAI = function(grid, lastGrid, moved){
  return this.ai.chooseNextMove(grid, lastGrid, moved);
};