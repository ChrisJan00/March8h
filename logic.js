//---------------------------------------------------------------------------------------------
GLOBAL.FloodCheck = function() {
	var self = this;
	self.board = GLOBAL.BoardInstance;
	
	self.checkFlood = function(ix,iy) {
		self.turnDelay = 0;
		disableTurn();
		
		self.board = GLOBAL.BoardInstance;
		
		var defended = false;
		if (GLOBAL.defenseMode) {
			var defended = self.checkDefense(ix, iy);
			if (!defended)
				self.checkAttack(ix, iy);
		} else {
			self.checkAttack(ix, iy);
			self.checkDefense(ix, iy);
		}
			
		setTimeout(enableTurn, self.turnDelay);
	}
	
	self.getNewFloodMarkers = function() {
		var floodFill = {}
		for (var i=0;i<GLOBAL.BoardInstance.cols;i++) {
			floodFill[i] = {};
			for (var j=0; j<GLOBAL.BoardInstance.rows; j++)
				floodFill[i][j] = true;
		}
		return floodFill;
	}
	
	self.findDefender = function(ix, iy, fakeStone) {
		function getDefender(x,y) {
			var candidate = self.board.get(x,y);
			if (candidate && candidate.owner == ownerWanted && candidate.element == elemWanted)
				return candidate;
			else
				return false;
		}
		
		var stone = self.board.get(ix,iy) || fakeStone;
		if (!stone) {
			return false;
		}
		
		var attacker = false;
		elemWanted = self.colorThatWins(stone.element);
		ownerWanted = 1-stone.owner;
		
		return getDefender(ix-1,iy) ||
				   getDefender(ix+1,iy) || 
				   getDefender(ix,iy-1) ||
				   getDefender(ix,iy+1);
	}
	
	self.checkDefense = function(x,y) {
		defender = self.findDefender(x,y);
		if (defender) {
			self.turnDelay = Math.max(self.turnDelay, GLOBAL.animationDelay * (GLOBAL.framesPerStrip+2));
			self.convertStone( defender, stone );
			GLOBAL.BoardInstance.startTileBlinking(defender.ix, defender.iy);
			return true;
		}
		
		return false;
	}
	
	self.findAttacks = function(sx, sy, fakeStone) {
		function parsePosition(ix,iy) {
			var victim = self.board.get(ix,iy);
			if (victim && victim.owner == ownerWanted && victim.element == elemWanted && 
				floodMarkers[ix][iy]) {
				attackStack.push(victim);
				resultStack.push(victim);
				floodMarkers[ix][iy] = false;
			}
		}
		
		var masterStone = self.board.get(sx,sy) || fakeStone;
		if (!masterStone) 
				return false;

		var attackStack = new Array();
		var resultStack = new Array();
		var floodMarkers = self.getNewFloodMarkers();
		
		attackStack.push(masterStone);
		
		var elemWanted = self.colorWonBy(masterStone.element);
		var ownerWanted = 1-masterStone.owner;
		
		while (attackStack.length) {
			var stone = attackStack.shift();
			var ix = stone.ix;
			var iy = stone.iy;
			
			parsePosition(ix-1, iy);
			parsePosition(ix+1, iy);
			parsePosition(ix, iy+1);
			parsePosition(ix, iy-1);
		}
		
		return resultStack;
	}
	
	self.checkAttack  = function(sx,sy) {
		var victimList = self.findAttacks(sx,sy);
		
		var stone = self.board.get(sx,sy);
		stone.step = -1;
		while (victimList.length) {
			var victim = victimList.shift();
			self.convertStone(stone,victim);
		}
	}
	
	self.countAttacks = function(x,y, board, fakeStone) {
		self.board = board || GLOBAL.BoardInstance;
		return self.findAttacks(x,y, fakeStone).length;
	}
	
	self.countDefenses = function(x,y, board, fakeStone) {
		self.board = board || GLOBAL.BoardInstance;
		return self.findDefender(x,y, fakeStone)?1:0;
	}
	
	self.convertStone = function(from, to) {
		to.element = from.element;
		to.owner = from.owner;
		to.bgColor = from.bgColor;
		to.step = from.step+1;
		
		var delay = to.step*GLOBAL.animationDelay;
		setTimeout(function(){GLOBAL.BoardInstance.startTileAnimation(to.ix, to.iy);}, delay);
		self.turnDelay = Math.max(self.turnDelay, GLOBAL.animationDelay * (GLOBAL.framesPerStrip+2) + delay);
	}
	
	self.tileWinsTile = function(elemAtk, elemDef) {
		if (elemAtk == 0 && elemDef == 3) return true;
		if (elemAtk == 1 && elemDef == 2) return true;
		if (elemAtk == 2 && elemDef == 0) return true;
		if (elemAtk == 3 && elemDef == 1) return true;
		return false;
	}
	
	self.colorWonBy = function(elem) {
		switch(elem) {
			case 0: return 3;
			case 1: return 2;
			case 2: return 0;
			case 3: return 1;
		}
	}
	
	self.colorThatWins = function(elem) {
		switch(elem) {
			case 0: return 2;
			case 1: return 3;
			case 2: return 1;
			case 3: return 0;
		}
	}
	
	self.countMarkers = function() {
		GLOBAL.counts = {};
		GLOBAL.counts[0] = 0;
		GLOBAL.counts[1] = 0;
		for (var i=0; i<GLOBAL.BoardInstance.cols; i++)
			for (var j=0; j<GLOBAL.BoardInstance.rows; j++) {
				if (self.board.get(i,j)) {
					GLOBAL.counts[ self.board.get(i,j).owner ]++;
				}
			}
	}
}

