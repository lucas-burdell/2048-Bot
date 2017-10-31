function NNLucasAI() {
  this.currentMove = 0;
  this.twoCount = 0;
  this.network = new synaptic.Architect.LSTM(16, 8, 4);
  this.trainer = new CaseyAI();
  this.learningRate = .3;
}

(function(){

  var squashGrid = function(grid){
    var array = [ ];
    var highestValue =  2;
    for (var x = 0; x <grid.size; x++) {
      if (!grid.cells[x]) grid.cells[x] = [0, 0, 0, 0];
      for (var y = 0; y < grid.size; y++) {
        var tile = grid.cells[x][y];
        var thisValue = tile ? tile.value : 0;
        if (thisValue > highestValue) highestValue = thisValue;
        array.push(thisValue);
      }
    }

    return array;
  };

  var getHighestValue = function(squash) {
    var highestValue = 2;
    for (var i = 0; i < squash.length; i++) {
      if (squash[i] > highestValue) {
        highestValue = squash[i];
      }
    }
    return highestValue;
  };

  var normalizeSquash = function(squash) {
    var highest = getHighestValue(squash);
    for (var i = 0; i < squash.length; i++) {
      squash[i] = squash[i] / highest;
    }
    return squash;
  };



  NNLucasAI.prototype.chooseNextMove = function(grid, previousGrid, lastMoveWorked){

    if (!lastMoveWorked) {
      //var rewardSet = [0, 0, 0, 0];
      //rewardSet[(previousGrid.previousMove + 1) % 4] = 1;
      //console.log(rewardSet);
      //this.network.propagate(this.learningRate, rewardSet);
    }

    var squashed = squashGrid(grid);


    var train = this.trainer.chooseNextMove(grid, previousGrid, lastMoveWorked);
    var trainResult = [0, 0, 0, 0];
    trainResult[train] = 1;

    var normalize = normalizeSquash(squashed);
    var results = this.network.activate(normalize);

    var highestResult = 0;
    for (var i = 1; i < results.length; i++){
      if (results[i] > results[highestResult]) {
        highestResult = i;
      }
    }

    //trainResult[highestResult] = difference;
    this.network.propagate(this.learningRate, trainResult);



    this.currentMove = highestResult;
    return this.currentMove;
  };
})();

