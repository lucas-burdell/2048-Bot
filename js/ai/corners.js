function Corners(){
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



  var getHeuristic = function(grid) {
    var topLeft = 0;
    var topRight = 0;
    var bottomLeft = 0;
    var bottomRight = 0;

    var gridCells = [
      grid.cells[0][0] !== null ? grid.cells[0][0].value : 0,
      grid.cells[0][1] !== null ? grid.cells[0][1].value : 0,
      grid.cells[1][0] !== null ? grid.cells[1][0].value : 0,
      grid.cells[0][3] !== null ? grid.cells[0][3].value : 0,
      grid.cells[0][2] !== null ? grid.cells[0][2].value : 0,
      grid.cells[1][3] !== null ? grid.cells[1][3].value : 0,
      grid.cells[3][0] !== null ? grid.cells[3][0].value : 0,
      grid.cells[3][1] !== null ? grid.cells[3][1].value : 0,
      grid.cells[2][0] !== null ? grid.cells[2][0].value : 0,
      grid.cells[3][3] !== null ? grid.cells[3][3].value : 0,
      grid.cells[3][2] !== null ? grid.cells[3][2].value : 0,
      grid.cells[2][3] !== null ? grid.cells[2][3].value : 0
    ];

    topLeft += gridCells[0] + gridCells[1] + gridCells[2];
    topRight += gridCells[3] + gridCells[4] + gridCells[5];
    bottomLeft += gridCells[6] + gridCells[7] + gridCells[8];
    bottomRight += gridCells[9] + gridCells[10] + gridCells[11];

    /*
    topLeft += grid.cells[0][0].value + grid.cells[0][1].value + grid.cells[1][0].value;
    topRight += grid.cells[0][3].value + grid.cells[0][2].value + grid.cells[1][3].value;
    bottomLeft += grid.cells[3][0].value + grid.cells[3][1].value + grid.cells[2][0].value;
    bottomRight += grid.cells[3][3].value + grid.cells[3][2].value + grid.cells[2][3].value;
    */
    var topHighest = topLeft > topRight ? topLeft : topRight;
    var bottomHighest = bottomLeft > bottomRight ? bottomLeft : bottomRight;
    return topHighest < bottomHighest ? bottomHighest : topHighest;
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
      grid.mergeCount = 0
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
      sums[0] = getHeuristic(move0);
    }


    var move1 = moveGrid(grid.copy(), 1);

    if (move1.moved){
      var states1 = createAllPossibleStates(move1);
      elementsToDepthIncrease += states1.length;
      for (var i = 0; i < states1.length; i++){
        queues[1].push(states1[i]);
      }
      sums[1] = getHeuristic(move1);
    }


    var move2 = moveGrid(grid.copy(), 2);

    if (move2.moved){
      var states2 = createAllPossibleStates(move2);
      elementsToDepthIncrease += states2.length;
      for (var i = 0; i < states2.length; i++){
        queues[2].push(states2[i]);
      }
      sums[2] = getHeuristic(move2);
    }

    var move3 = moveGrid(grid.copy(), 3);
    if (move3.moved) {
      var states3 = createAllPossibleStates(move3);
      elementsToDepthIncrease += states3.length;
      for (var i = 0; i < states3.length; i++){
        queues[3].push(states3[i]);
      }
      sums[3] = getHeuristic(move3);
    }



    while (queuesAreEmpty(queues) === false){
      for (var queueNum = 0; queueNum < queues.length; queueNum++) {
        if (queues[queueNum].length === 0){
          continue;
        }
        var nextBoard = queues[queueNum].shift();
        elementsToDepthIncrease--;
        for (var direction = 0; direction < 4; direction++){
          sums[queueNum] += getHeuristic(nextBoard);

          var afterState = moveGrid(nextBoard, direction);
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

  Corners.prototype.chooseNextMove = function(grid, previousGrid, lastMoveWorked){

    var nextMove = decideMove(grid, this.recursionDepth);

    this.currentMove = nextMove;

    return this.currentMove;
  };
})();

