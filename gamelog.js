GLOBAL.GameLog = function() {
	var self = this;
	self.moves = [];
	self.index = 0;
	
	
	self.init = function() {
		self.moves = [];
		self.index = 0;
		self.lineCount = 0;
		self.output = document.getElementById("logWindow");
		self.output.innerHTML = "";
	}

	self.print = function(_who, text) 
	{
		self.lineCount++;
		//var paragraphStart = "<p style=\"font-weight:bold; font-family:sans-serif; color:"+colorForPlayer(_who)+"\">";
		var paragraphStart = "<span style=\"font-family:sans-serif; color:"+colorForPlayer(_who)+"\">";
		var paragraphEnd = "<br></span>";
		self.outputString = paragraphStart + text + paragraphEnd + self.outputString;
		
		//self.output.innerHTML = paragraphStart + text + paragraphEnd + self.output.innerHTML;
		// assuming lines are 28 pixels tall (14+14)
		//self.output.scrollTop = self.output.clientHeight - self.container.clientHeight;
		//self.output.scrollTop = self.lineCount * 28;
	}
	
	self.elementName = function(_element) 
	{
		switch (_element) {
			case 0: return "fire"; break;
			case 1: return "earth"; break;
			case 2: return "water"; break;
			case 3: return "wind"; break;
		}
	}
	
	self.verb = function(_element)
	{
		switch (_element) {
			case 0: return "burns"; break;
			case 1: return "dries"; break;
			case 2: return "extinguishes"; break;
			case 3: return "blows"; break;
		}
	}
	
	self.playerName = function(_who)
	{
		if (_who==1 && GLOBAL.computerEnabled)
			return "computer";
		return _who?"orange":"purple";
	}
	
	self.registerMove = function(_who, _stone, _fromPosition) 
	{
		var playerName = self.playerName(_who);
		var elementName = self.elementName(_stone.element);
		var turnNumber = self.index + 1;
		var playString = playerName+" played "+elementName+" at ("+_stone.ix+", "+_stone.iy+")";
		
		self.moves[self.index] = {
			who: _who,
			element: _stone.element,
			x: _stone.ix,
			y: _stone.iy,
			pileIndex : _fromPosition,
		};
		
		self.outputString = "";
		
		self.outputString = "</div>";
		self.countChanges(_stone);
		self.print(_who, playString);
		self.outputString = "<span style=\"font-family:sans-serif\">" + turnNumber + ". " + "</span>" + self.outputString;
		self.outputString = "<div id=\"turn" + turnNumber + "\">" + self.outputString;
		
		self.output.innerHTML = self.outputString + self.output.innerHTML;
		
		self.index++;
	}
	
	self.showResult = function(_who, stoneFrom, stoneTo, stoneCount) 
	{
		var attackerName = self.playerName(stoneFrom.owner);
		var defenderName = self.playerName(stoneTo.owner);
		var attackerElement = self.elementName(stoneFrom.element);
		var defenderElement = self.elementName(stoneTo.element);
		var verb = self.verb(stoneFrom.element);

		var playString = "<span style=\"padding-left:40px\">" 
		+ attackerName + "'s " + attackerElement + " " + verb + " "
		+ stoneCount + " " + defenderName + "'s " + defenderElement + (stoneCount>1?"s":"")
		+ "</span>";
		 
		self.print(_who, playString);
		
		// todo: register that in moves
	}
	
	self.copyStone = function(stone) {
		return {
			ix : stone.ix,
			iy : stone.iy,
			owner : stone.owner,
			element : stone.element
		}
	}
	
	self.copyList = function(list) {
		var myList = [];
		for (var i=0;i<list.length;i++)
			myList[i] = self.copyStone(list[i]);
		return myList;
	}
	
	self.countChanges = function(stone) {
		GLOBAL.floodCheck.board = GLOBAL.BoardInstance;
		var attackList = GLOBAL.floodCheck.findAttacks(stone.ix,stone.iy,stone);
		var defenseList = GLOBAL.floodCheck.findDefender(stone.ix,stone.iy,stone);
		var attackCount = attackList.length;
		var defenseCount = defenseList?1:0;
		
		if (GLOBAL.defenseMode) {
			if (defenseCount > 0) {
				self.moves[self.index].defense = self.copyStone(defenseList);
				GLOBAL.gameLog.showResult(
					GLOBAL.action.turn, 
					{
						element: GLOBAL.floodCheck.colorThatWins(stone.element),
						owner : 1-stone.owner,
					}, 
					stone,
					1);
			}
			else
			if (attackCount > 0) {
				self.moves[self.index].attack = self.copyList(attackList);
				GLOBAL.gameLog.showResult(
					GLOBAL.action.turn, 
					stone,
					{
						element: GLOBAL.floodCheck.colorWonBy(stone.element),
						owner : 1-stone.owner
					}, 
					attackCount );
			}
		} else {
			if (attackCount > 0) {
				self.moves[self.index].attack = self.copyList(attackList);
				GLOBAL.gameLog.showResult(
					GLOBAL.action.turn, 
					stone,
					{
						element: GLOBAL.floodCheck.colorWonBy(stone.element),
						owner : 1-stone.owner
					}, 
					attackCount );
			}
			if (defenseCount > 0) {
				self.moves[self.index].defense = self.copyStone(defenseList);
				GLOBAL.gameLog.showResult(
					GLOBAL.action.turn, 
					{
						element: GLOBAL.floodCheck.colorThatWins(stone.element),
						owner : 1-stone.owner
					}, 
					stone,
					1);
			}
		}
	}
	
	self.tellChanges = function() {
		var defenseItem = self.moves[self.index].defense;
		var attackList = self.moves[self.index].attack;
		
		if (GLOBAL.defenseMode) {
			if (defenseItem) {
				GLOBAL.gameLog.showResult(
					self.moves[self.index].who, 
					{
						element: defenseItem.element,
						owner : defenseItem.owner,
					}, 
					{
						element: self.moves[self.index].element,
						owner: self.moves[self.index].who
					},
					1);
			}
			else
			if (attackList) {
				GLOBAL.gameLog.showResult(
					self.moves[self.index].who, 
					{
						element: self.moves[self.index].element,
						owner: self.moves[self.index].who
					},
					{
						element: attackList[0].element,
						owner : attackList[0].owner
					}, 
					attackList.length );
			}
		} else {
			if (attackList) {
				GLOBAL.gameLog.showResult(
					self.moves[self.index].who, 
					{
						element: self.moves[self.index].element,
						owner: self.moves[self.index].who
					},
					{
						element: attackList[0].element,
						owner : attackList[0].owner
					}, 
					attackList.length );
			}
			if (defenseItem) {
				GLOBAL.gameLog.showResult(
					self.moves[self.index].who, 
					{
						element: defenseItem.element,
						owner : defenseItem.owner,
					}, 
					{
						element: self.moves[self.index].element,
						owner: self.moves[self.index].who
					},
					1);
			}
		}
	}
	
	self.undo = function() 
	{
		if (self.index==0)
			return;
			
		// undo the changes from the last move
		var turnName = "turn" + self.index;
		var turnSpan = document.getElementById(turnName);
		var container = document.getElementById("logWindow");
		container.removeChild(turnSpan);
		
		self.unapply();
		self.index--;
	}
	
	self.redo = function() 
	{
		if (self.index >= self.moves.length)
			return;
		
		var _who = self.moves[self.index].who;
		var playerName = self.playerName(_who);
		var elementName = self.elementName(self.moves[self.index].element);
		var turnNumber = self.index + 1;
		var playString = playerName+" played "+elementName+" at ("+self.moves[self.index].x+", "+self.moves[self.index].y+")";
		
		self.outputString = "</div>";
		self.tellChanges();
		self.print(_who, playString);
		self.outputString = "<span style=\"font-family:sans-serif\">" + turnNumber + ". " + "</span>" + self.outputString;
		self.outputString = "<div id=\"turn" + turnNumber + "\">" + self.outputString;
		
		self.output.innerHTML = self.outputString + self.output.innerHTML;
		
		self.reapply();
		self.index++;
	}
	
	self.unapply = function() 
	{
		var move = self.moves[self.index-1];
		// repaint stone in pile
		var currentPile = GLOBAL.Piles[move.who];
		var pileX = Math.floor(move.pileIndex/currentPile.rows);
		var pileY = move.pileIndex % currentPile.rows;
		currentPile[pileX][pileY] = {
			ix : pileX,
			iy : pileY,
			owner : move.who,
			element : move.element,
			bgColor : "#FFFFFF",
			visible : true,
			selected : false,
			active : false
		}
		currentPile.redrawTile(pileX, pileY);
		
		// delete stone from board
		GLOBAL.BoardInstance[move.x][move.y] = null;
		GLOBAL.BoardInstance.redrawTile(move.x,move.y);
		
		// undo attacks
		if (move.attack)
			for (var i=0;i<move.attack.length; i++) {
				var x = move.attack[i].ix;
				var y = move.attack[i].iy;
				var dest = GLOBAL.BoardInstance[x][y];
				dest.owner = move.attack[i].owner;
				dest.element = move.attack[i].element;
				dest.bgColor = colorForPlayer(dest.owner);
				GLOBAL.BoardInstance.redrawTile(x,y);
			}
			
		// change the turn
		GLOBAL.floodCheck.board = GLOBAL.BoardInstance;
 		GLOBAL.floodCheck.countMarkers();
		GLOBAL.action.turn = move.who;
		showPlayer();
	}
	
	self.reapply = function()
	{
		var move = self.moves[self.index];
		var _owner = move.who;

		// delete stone from pile
		var currentPile = GLOBAL.Piles[_owner];
		var pileX = Math.floor(move.pileIndex/currentPile.rows);
		var pileY = move.pileIndex % currentPile.rows;
		
		currentPile.del(pileX, pileY);
		currentPile.redrawTile(pileX, pileY);
		
		// move stone to board
		GLOBAL.BoardInstance[move.x][move.y] = {
			ix : move.x,
			iy : move.y,
			owner : _owner,
			element : move.element,
			bgColor : colorForPlayer(_owner),
			visible : true,
			selected : false,
			active : true,
		};
		GLOBAL.BoardInstance.redrawTile(move.x, move.y);
		
		if (move.attack)
			for (var i=0;i<move.attack.length; i++) {
				var x = move.attack[i].ix;
				var y = move.attack[i].iy;
				var dest = GLOBAL.BoardInstance[x][y];
				dest.owner = _owner;
				dest.element = move.element;
				dest.bgColor = colorForPlayer(_owner);
				GLOBAL.BoardInstance.redrawTile(x,y);
			}
			
		if (move.defense) {
			var dest = GLOBAL.BoardInstance[move.x][move.y];
			dest.owner = move.defense.owner;
			dest.element = move.defense.element;
			dest.bgColor = colorForPlayer(move.defense.owner);
			GLOBAL.BoardInstance.redrawTile(move.x, move.y);
		}
		
		GLOBAL.floodCheck.board = GLOBAL.BoardInstance;
 		GLOBAL.floodCheck.countMarkers();
		GLOBAL.action.turn = 1-_owner;
		showPlayer();
	}
	// todo: replay
}
