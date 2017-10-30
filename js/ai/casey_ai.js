function CaseyAI(){
  this.currentMove = 0;
  this.twoCount = 0
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
            mergeCount += merged.value;

            grid.insertTile(merged);
            grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

          } else {
            moveTile(grid, tile, positions.farthest);
          }
          if (!positionsEqual(cell, tile)) {
              moved = true; // The tile moved from its original cell!
          }
        }
      });

    });


    return {grid: grid, mergeCount: moved ? mergeCount : -1};
  };

  var getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  };

  CaseyAI.prototype.chooseNextMove = function(grid, previousGrid, lastMoveWorked){

    var gridValues = [
      // weight top and right slightly more heavily
      moveGrid(grid.copy(), 0).mergeCount * 1.3,
      moveGrid(grid.copy(), 1).mergeCount * 1.5,
      moveGrid(grid.copy(), 2).mergeCount,
      moveGrid(grid.copy(), 3).mergeCount
      /*
      getValue(squashGrid(moveGrid(grid.copy(), 0))),
      getValue(squashGrid(moveGrid(grid.copy(), 1))),
      getValue(squashGrid(moveGrid(grid.copy(), 2))),
      getValue(squashGrid(moveGrid(grid.copy(), 3)))
      */
    ];

    var highest = 0;
    var sameCount = 0;
    for (var i = 1; i <gridValues.length; i++){
      //console.log(gridValues[i]);
      if (gridValues[i] > gridValues[highest]) {
        highest = i;
      } else if(gridValues[i] === gridValues[highest]) {
        sameCount++;
      }
    }
    if (sameCount === 3) {
      this.currentMove =  getRandomInt(0, 4);
    } else {

    }
    this.currentMove = highest;
    while (gridValues[highest] === -1) {
      this.currentMove = (this.currentMove + 1) % 4;
    }
    return this.currentMove;
  };
})();

