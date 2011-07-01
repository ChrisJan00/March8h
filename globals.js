var GLOBAL = {}

GLOBAL.findAbsoluteX = function(object) {
	var x = 0;
	while (object) {
		x += object.offsetLeft;
		object = object.offsetParent;
	}
	return x;
}

GLOBAL.findAbsoluteY = function(object) {
	var y = 0;
	while(object) {
		y += object.offsetTop;
		object = object.offsetParent;
	}
	return y;
}

GLOBAL.strings = {
	gameTitle : "elementis",
	firstPlayerName : "purple",
	secondPlayerName : "orange",
	computerPlayerName : "computer",
	thinkingMessage : "thinking...",
	firstVictory : "purple won!",
	secondVictory : "orange won!",
	tieGame : "tie game",
	fireName : "fire",
	earthName : "earth",
	waterName : "water",
	airName : "wind",
	fireAttack : "burns",
	earthAttack : "dries",
	waterAttack : "extinguishes",
	airAttack : "blows",
	playAction : "played",
	prePosition : "at",
	turn : "turn",
	possesive : "'s",
	plural : "s",
	pvpEasy : "player vs player (easy)",
	pvpDef : "player vs player (defense)",
	pvcEasy : "player vs computer (easy)",
	pvcDef : "player vs computer (hard)",
	optionsButton : "options",
	optionsMenu : "options",
	undoButton : "undo",
	redoButton : "redo",
	gamelogToggleButton : "toggle log",
	newGameButton : "start new game",
	exitGameButton : "exit game",
	closeMenuButton : "continue",


};
