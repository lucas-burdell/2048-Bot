function LucasAI(){
  this.currentMove = 0;
  this.twoCount = 0
}

(function(){
  var getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  };
  LucasAI.prototype.chooseNextMove = function(grid, previousGrid, lastMoveWorked){
    if (!lastMoveWorked) {
        this.currentMove = (this.currentMove + 1) % 4;
        if (this.currentMove === 2) {
          if (this.twoCount <= 5) {
            this.currentMove = 3;
            this.twoCount++;
          } else {
            this.twoCount = 0;
            this.currentMove = 2;
          }
        }
    } else {
      this.currentMove = (this.currentMove + 1) % 2;
    }
    return this.currentMove;
  };
})();

