function Stacks(){
  this.currentMove = this.twoCount = 0;
  this.recursionDepth = AI_RECURSION_DEPTH;
}

(function(){

  var squashGrid = function(grid){
    var array = [ ];
    var highestValue =  2;
    for (var x = 0; x < grid.size; x++) {
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

  var getValue = function(squash) {
    var value = 0;
    var nonEmptyTiles = 0;
    for (var i = 0; i < squash.length; i++) {
      value += squash[i];
      if (squash[i] !== 0) {
        nonEmptyTiles++;
      }
    }
    return value / nonEmptyTiles;
  };

  var normalizeSquash = function(squash) {
    var highest = getHighestValue(squash);
    for (var i = 0; i < squash.length; i++) {
      squash[i] = squash[i] / highest;
    }
    return squash;
  };


  var getVector = function (direction) {
    // Vectors representing tile movement
    var map = {
      0: {x: 0, y: -1}, // Up
      1: {x: 1, y: 0},  // Right
      2: {x: 0, y: 1},  // Down
      3: {x: -1, y: 0}   // Left
    };

    return map[direction];
  };

  var buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < 4; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  };

  var findFarthestPosition = function (grid, cell, vector) {
    var previous;


    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;

      cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (grid.withinBounds(cell) &&
    grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell // Used to check if a merge is required
    };
  };

  var moveTile = function (grid, tile, cell) {
    grid.cells[tile.x][tile.y] = null;
    grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  };

  var positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
  };



  var getCell = function(grid, x, y) {
    return grid.cells[x][y] !== null ? grid.cells[x][y].value : 0;
  };

  var getHeuristic = function(grid) {
    var totalScore = 0;
    // merges and spaces
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (i < 3) {
          if (getCell(grid, i, j) === getCell(grid, i + 1, j)) {
            if (getCell(grid, i, j) === 0) {
              totalScore += 256;
            } else {
              totalScore += getCell(grid, i, j) * 2;
            }
          }
        }
      }
    }

    // edges
    for (var i = 0; i < 4; i++) {
      totalScore += getCell(grid, i, 0) * 2;
      totalScore += getCell(grid, i, 3) * 2;
      totalScore += getCell(grid, 0, i) * 2;
      totalScore += getCell(grid, 3, i) * 2;
    }


    return totalScore;
  };


  var moveGrid = function(grid, direction){

    var vector     = getVector(direction);

    var traversals = buildTraversals(vector);
    var moved      = false;
    var mergeCount = 0;


    grid.eachCell(function (x, y, tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });


    grid.mergeCount = 0;
    grid.mergeValue = 0;
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        var cell = { x: x, y: y };
        var tile = grid.cellContent(cell);

        if (tile) {

          var positions = findFarthestPosition(grid, cell, vector);
          var next      = grid.cellContent(positions.next);

          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            var merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];
            grid.mergeValue += 1;
            //grid.mergeValue += merged.value;

            grid.insertTile(merged);
            grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

          } else {
            moveTile(grid, tile, positions.farthest);
          }
          if (!positionsEqual(cell, tile)) {
              grid.moved = true; // The tile moved from its original cell!
          }
        }
      });

    });

    if (!grid.moved) {

    } else {
      grid.mergeCount = getHeuristic(grid);
    }
    return grid;
  };

  var getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  };

  var createAllPossibleStates = function(grid) {
    var output = [ ];
    var available = grid.availableCells();
    available.forEach(function(element){
      var outputGrid = grid.copy();
      var tile = new Tile(element, 2);
      outputGrid.insertTile(tile);
      //outputGrid.cells[element.x][element.y].value = 2;
      output.push(outputGrid);
    });

    return output;
  };

  var queuesAreEmpty = function(queues){
    for (var i = 0; i < queues.length; i++){
      if (queues[i].length !== 0){
        return false;
      }
    }
    return true;
  };

  var decideMove = function(grid, recurseValue) {

    var queues = [
      // weight top and right slightly more heavily
      [],
      [],
      [],
      [] // getHighestGrid(moveGrid(grid.copy(), 2), recurseValue, startValue),
    ];

    var sums = [
      0,
      0,
      0,
      0
    ];

    var currentDepth = 1;
    var maxDepth = recurseValue;
    var elementsToDepthIncrease = 0;
    var nextElementsToDepthIncrease = 0;

    // populate queues
    var move0 = moveGrid(grid.copy(), 0);
    if (move0.moved) {
      var states0 = createAllPossibleStates(move0);
      elementsToDepthIncrease += states0.length;
      for (var i = 0; i < states0.length; i++){
        queues[0].push(states0[i]);
      }
      sums[0] = getHeuristic(grid);// + move0.mergeValue;
    }


    var move1 = moveGrid(grid.copy(), 1);

    if (move1.moved){
      var states1 = createAllPossibleStates(move1);
      elementsToDepthIncrease += states1.length;
      for (var i = 0; i < states1.length; i++){
        queues[1].push(states1[i]);
      }
      sums[1] = getHeuristic(grid);// + move0.mergeValue;
    }


    var move2 = moveGrid(grid.copy(), 2);

    if (move2.moved){
      var states2 = createAllPossibleStates(move2);
      elementsToDepthIncrease += states2.length;
      for (var i = 0; i < states2.length; i++){
        queues[2].push(states2[i]);
      }
      sums[2] = getHeuristic(grid)// + move0.mergeValue;
    }

    var move3 = moveGrid(grid.copy(), 3);
    if (move3.moved) {
      var states3 = createAllPossibleStates(move3);
      elementsToDepthIncrease += states3.length;
      for (var i = 0; i < states3.length; i++){
        queues[3].push(states3[i]);
      }
      sums[3] = getHeuristic(grid)//; + move0.mergeValue;
    }


    var startTime = (new Date()).getTime();

    while (queuesAreEmpty(queues) === false){
      for (var queueNum = 0; queueNum < queues.length; queueNum++) {
        if (queues[queueNum].length === 0){
          continue;
        }
        var nextBoard = queues[queueNum].shift();
        elementsToDepthIncrease--;
        for (var direction = 0; direction < 4; direction++){
          var heuristicValue = getHeuristic(nextBoard);
          var afterState = moveGrid(nextBoard, direction);
          sums[queueNum] += (heuristicValue);// * Math.pow(AI_DISCOUNT, currentDepth);


          //if (currentDepth <= maxDepth && afterState.moved) {
          if (currentDepth <= maxDepth && afterState.moved) {
            var states = createAllPossibleStates(afterState);
            nextElementsToDepthIncrease += states.length;
            for (var i = 0; i < states.length; i++){
              queues[queueNum].push(states[i]);
            }
          }



        }

        if (elementsToDepthIncrease <= 0){
          currentDepth++;
          elementsToDepthIncrease = nextElementsToDepthIncrease;
          nextElementsToDepthIncrease = 0;
        }
      }
    }


    //grids[0].mergeCount *= 1.3;
    //grids[1].mergeCount *= 1.5;


    var highest = 0;
    var sameCount = 0;
    //console.log(highest + ": " + sums[highest]);
    for (var i = 1; i < sums.length; i++){
      //console.log(i + ": " + sums[i]);
      if (sums[i] > sums[highest]) {
        highest = i;
      } else if(sums[i] === sums[highest]) {
        sameCount++;
      }
    }


    return highest;
  };

  Stacks.prototype.chooseNextMove = function(grid, previousGrid, lastMoveWorked){

    var nextMove = decideMove(grid, this.recursionDepth);

    this.currentMove = nextMove;

    return this.currentMove;
  };
})();

