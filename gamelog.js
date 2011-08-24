G.GameLog = function() {
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
	
	self.visible = false;
	self.show = function() {
		self.visible = true;
		document.getElementById("logContainer").style.visibility = "visible";
		document.getElementById("logWindow").style.visibility = "visible";
	}
	
	self.hide = function() {
		self.visible = false;
		document.getElementById("logContainer").style.visibility = "hidden";
		document.getElementById("logWindow").style.visibility = "hidden";
	}
	
	self.toggle = function() {
		if (self.visible)
			self.hide();
		else
			self.show();
	}
	
	self.updateVisible = function()
	{
		if (self.visible)
			self.show();
		else
			self.hide();	
	}
	
	self.unDisplay = function()
	{
		document.getElementById("logContainer").style.visibility = "hidden";
		document.getElementById("logWindow").style.visibility = "hidden";
		
	}
	
	self.print = function(_who, text) 
	{
		self.lineCount++;
		//var paragraphStart = "<p style=\"font-weight:bold; font-family:CustomFont, sans-serif; color:"+G.display.colorForPlayerBorder(_who)+"\">";
		var paragraphStart = "<span style=\"font-family:CustomFont, sans-serif; color:"+G.display.colorForPlayerBorder(_who)+"\">";
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
			case 0: return G.strings.fireName; break;
			case 1: return G.strings.earthName; break;
			case 2: return G.strings.waterName; break;
			case 3: return G.strings.airName; break;
		}
	}
	
	self.verb = function(_element)
	{
		switch (_element) {
			case 0: return G.strings.fireAttack; break;
			case 1: return G.strings.earthAttack; break;
			case 2: return G.strings.waterAttack; break;
			case 3: return G.strings.airAttack; break;
		}
	}
	
	self.playerName = function(_who)
	{
		if (!G.playerManager.isHuman(_who))
			return G.strings.computerPlayerName;
		return _who?G.strings.secondPlayerName:G.strings.firstPlayerName;
	}
	
	self.registerMove = function(_who, _stone, _fromPosition) 
	{
		var playerName = self.playerName(_who);
		var elementName = self.elementName(_stone.element);
		var turnNumber = self.index + 1;
		var playString = playerName+" "+G.strings.playAction+" "+elementName+" "+G.strings.prePosition+" ("+_stone.ix+", "+_stone.iy+")";
		
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
		self.outputString = "<span style=\"font-family:CustomFont, sans-serif\">" + turnNumber + ". " + "</span>" + self.outputString;
		self.outputString = "<div id=\"turn" + turnNumber + "\">" + self.outputString;
		
		self.output.innerHTML = self.outputString + self.output.innerHTML;
		
		self.index++;
		
		// force end of memory here
		if (self.moves.length > self.index)
			self.moves.splice(self.index, self.moves.length - self.index + 1);
	}
	
	self.showResult = function(_who, stoneFrom, stoneTo, stoneCount) 
	{
		var attackerName = self.playerName(stoneFrom.owner);
		var defenderName = self.playerName(stoneTo.owner);
		var attackerElement = self.elementName(stoneFrom.element);
		var defenderElement = self.elementName(stoneTo.element);
		var verb = self.verb(stoneFrom.element);

		var playString = "<span style=\"padding-left:40px\">" 
		+ attackerName + G.strings.possessive + " " + attackerElement + " " + verb + " "
		+ stoneCount + " " + defenderName + G.strings.possessive + " " + defenderElement + (stoneCount>1?G.strings.plural:"")
		+ "</span>";
		 
		self.print(_who, playString);
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
		G.floodCheck.board = G.board;
		var attackList = G.floodCheck.findAttacks(stone.ix,stone.iy,stone);
		var defenseList = G.floodCheck.findDefender(stone.ix,stone.iy,stone);
		var attackCount = attackList.length;
		var defenseCount = defenseList?1:0;
		
		if (G.defenseMode) {
			if (defenseCount > 0) {
				self.moves[self.index].defense = self.copyStone(defenseList);
				G.gameLog.showResult(
					G.playerManager.currentId(), 
					{
						element: G.floodCheck.colorThatWins(stone.element),
						owner : 1-stone.owner,
					}, 
					stone,
					1);
			}
			else
			if (attackCount > 0) {
				self.moves[self.index].attack = self.copyList(attackList);
				G.gameLog.showResult(
					G.playerManager.currentId(), 
					stone,
					{
						element: G.floodCheck.colorWonBy(stone.element),
						owner : 1-stone.owner
					}, 
					attackCount );
			}
		} else {
			if (attackCount > 0) {
				self.moves[self.index].attack = self.copyList(attackList);
				G.gameLog.showResult(
					G.playerManager.currentId(), 
					stone,
					{
						element: G.floodCheck.colorWonBy(stone.element),
						owner : 1-stone.owner
					}, 
					attackCount );
			}
			if (defenseCount > 0) {
				self.moves[self.index].defense = self.copyStone(defenseList);
				G.gameLog.showResult(
					G.playerManager.currentId(), 
					{
						element: G.floodCheck.colorThatWins(stone.element),
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
		
		if (G.defenseMode) {
			if (defenseItem) {
				G.gameLog.showResult(
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
				G.gameLog.showResult(
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
				G.gameLog.showResult(
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
				G.gameLog.showResult(
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
		
		G.pauseManager.enablePause();
		
		// undo the changes from the last move
		var turnName = G.strings.turn + self.index;
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
		
		G.pauseManager.enablePause();
		
		var _who = self.moves[self.index].who;
		var playerName = self.playerName(_who);
		var elementName = self.elementName(self.moves[self.index].element);
		var turnNumber = self.index + 1;
		var playString = playerName+" " + G.strings.playAction +" "+elementName+" "+G.strings.prePosition+" ("+self.moves[self.index].x+", "+self.moves[self.index].y+")";
		
		self.outputString = "</div>";
		self.tellChanges();
		self.print(_who, playString);
		self.outputString = "<span style=\"font-family:CustomFont, sans-serif\">" + turnNumber + ". " + "</span>" + self.outputString;
		self.outputString = "<div id=\"turn" + turnNumber + "\">" + self.outputString;
		
		self.output.innerHTML = self.outputString + self.output.innerHTML;
		
		self.reapply();
		self.index++;
	}
	
	self.unapply = function() 
	{
		var move = self.moves[self.index-1];
		// repaint stone in pile
		var currentPile = G.Piles[move.who];
		var pileX = Math.floor(move.pileIndex/currentPile.rows);
		var pileY = move.pileIndex % currentPile.rows;
		currentPile[pileX][pileY] = {
			ix : pileX,
			iy : pileY,
			owner : move.who,
			element : move.element,
			bgColor : G.colors.white,
			visible : true,
			selected : false,
			active : false
		}
		currentPile.selection = null;
		currentPile.redrawBorder( true );
		currentPile.redrawTile(pileX, pileY);
		currentPile.redrawBorder( false );
		
		// delete stone from board
		G.board[move.x][move.y] = null;
		G.board.redrawTile(move.x,move.y);
		G.board.refreshTileBordersExpansive(move.x, move.y);
		G.board.stoneCount--;
		
		// undo attacks
		if (move.attack)
			for (var i=0;i<move.attack.length; i++) {
				var x = move.attack[i].ix;
				var y = move.attack[i].iy;
				var dest = G.board[x][y];
				dest.owner = move.attack[i].owner;
				dest.element = move.attack[i].element;
				dest.bgColor = G.display.colorForPlayer(dest.owner);
				G.board.redrawTile(x,y);
			}
			
		// change the turn
		G.floodCheck.board = G.board;
 		G.floodCheck.countMarkers();
		G.playerManager.setCurrentId(move.who);
		G.display.showPlayer();
		G.graphicsManager.redraw();
		//enableTurn();
	}
	
	self.reapply = function()
	{
		var move = self.moves[self.index];
		var _owner = move.who;

		// delete stone from pile
		var currentPile = G.Piles[_owner];
		var pileX = Math.floor(move.pileIndex/currentPile.rows);
		var pileY = move.pileIndex % currentPile.rows;
		
		currentPile.selection = null;
		currentPile.del(pileX, pileY);
		currentPile.redrawTile(pileX, pileY);
		
		// move stone to board
		G.board[move.x][move.y] = {
			ix : move.x,
			iy : move.y,
			owner : _owner,
			element : move.element,
			bgColor : G.display.colorForPlayer(_owner),
			visible : true,
			selected : false,
			active : true,
		};
		G.board.redrawTile(move.x, move.y);
		G.board.stoneCount++;
		
		if (move.attack)
			for (var i=0;i<move.attack.length; i++) {
				var x = move.attack[i].ix;
				var y = move.attack[i].iy;
				var dest = G.board[x][y];
				dest.owner = _owner;
				dest.element = move.element;
				dest.bgColor = G.display.colorForPlayer(_owner);
				G.board.redrawTile(x,y);
			}
			
		if (move.defense) {
			var dest = G.board[move.x][move.y];
			dest.owner = move.defense.owner;
			dest.element = move.defense.element;
			dest.bgColor = G.display.colorForPlayer(move.defense.owner);
			G.board.redrawTile(move.x, move.y);
		}
		
		G.floodCheck.board = G.board;
 		G.floodCheck.countMarkers();
		G.playerManager.next();
		
		if (G.board.stoneCount < G.board.maxStones) {
			G.display.showPlayer();
		} else {
			G.display.checkVictory();
		}
		
		G.graphicsManager.redraw();
		
		// enableTurn();
	}
	// todo: replay
}
