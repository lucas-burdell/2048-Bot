var AI_WAIT_TIME = 250;
var AI_NUMBER_OF_GAMES = 5;
var AI_ACTUATOR_ON = true;
var AI_SKIP_MOVE_DELAY = 1;
var AI_RECURSION_DEPTH = 2;
var AI_RUN_TIME = 500;
var AI_DISCOUNT = .8;

(function(){
  var inputs = document.forms["options-form"].getElementsByTagName("input");
  for (var i = 0; i < inputs.length; i++) {
    var id = inputs[i].id;
    const input = inputs[i];
    console.log(id);
    switch (id) {
      case "options-numberofgames":
        console.log("numberofgames added");
        input.onchange = function(){AI_NUMBER_OF_GAMES = parseInt(input.value);};
        break;
      case "options-movetime":
        input.onchange = function(){AI_WAIT_TIME = parseInt(input.value);};
        break;
      case "options-visualizemove":
        input.onchange = function(){AI_ACTUATOR_ON = input.checked;};
        break;
      case "options-moveskips":
        input.onchange = function(){AI_SKIP_MOVE_DELAY = parseInt(input.value);};
        break;
    }
  }
})();