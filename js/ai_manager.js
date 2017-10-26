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
    clearInterval(this.aiThread);
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
  }
  var self = this;
  this.aiThread = setInterval(function(){
    if (self.gameManager.over) {
      if (self.numberOfGamesPlayed < AI_NUMBER_OF_GAMES) {
        self.numberOfGamesPlayed++;
        self.gameManager.restart();
      } else {
        clearInterval(self.aiThread);
      }
    } else {
      this.lastMoveResult = self.gameManager.nextMoveAI(this.lastMoveResult);
    }
  }, AI_WAIT_TIME);
};

AIManager.prototype.queryAI = function(grid, lastGrid, moved){
  return this.ai.chooseNextMove(grid, lastGrid, moved);
};