//---------------------------------------------------------------------------------------------
GLOBAL.FloodCheck = function() {
	var self = this;
	self.board = GLOBAL.BoardInstance;
	self.floodMarkers = [];
	
	self.checkFlood = function(ix,iy, board) {
		self.evalBoard(ix,iy,board);
	}
	
	self.evalBoard = function(ix, iy, board) {
		self.board = board || GLOBAL.BoardInstance;
		
		if (GLOBAL.defenseMode) {
			var defended = self.checkDefense(ix, iy);
			if (!defended)
				self.checkAttack(ix, iy);
		} else {
			self.checkAttack(ix, iy);
			self.checkDefense(ix, iy);
		}
	}
	
	self.silentCheckFlood = function(ix, iy, board) {
		var turnDelay = GLOBAL.turnDelay;
		self.evalBoard(ix,iy,board);
		GLOBAL.turnDelay = turnDelay;
	}
	
	self.resetFloodMarkers = function() {
		for (var i=0;i<self.board.cols;i++) {
			if (!self.floodMarkers[i])
				self.floodMarkers[i] = [];
			for (var j=0; j<self.board.rows; j++)
				self.floodMarkers[i][j] = true;
		}
	}
	
	self.findDefender = function(ix, iy, fakeStone) {
		function getDefender(x,y) {
			var candidate = self.board[x]?self.board[x][y]:null;
			if (candidate && candidate.owner == ownerWanted && candidate.element == elemWanted)
				return candidate;
			else
				return false;
		}
		
		var stone = self.board[ix][iy] || fakeStone;
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
		var stone = self.board[x][y];
		defender = self.findDefender(x,y);
		if (defender) {
			self.convertStone( defender, stone );
			
			if (self.board == GLOBAL.BoardInstance) {
				GLOBAL.turnDelay = Math.max(GLOBAL.turnDelay, GLOBAL.animationDelay * (GLOBAL.framesPerStrip+2));
				GLOBAL.BoardInstance.startTileBlinking(defender.ix, defender.iy);
			}
			return true;
		}
		
		return false;
	}
	
	self.findAttacks = function(sx, sy, fakeStone) {
		function parsePosition(ix,iy) {
			var victim = self.board[ix]?self.board[ix][iy]:null;
			if (victim && victim.owner == ownerWanted && victim.element == elemWanted && 
				self.floodMarkers[ix][iy]) {
				victim.step = step+1;
				attackStack.push(victim);
				resultStack.push(victim);
				self.floodMarkers[ix][iy] = false;
			}
		}
		
		var masterStone = self.board[sx][sy] || fakeStone;
		if (!masterStone) 
				return false;

		var attackStack = new Array();
		var resultStack = new Array();
		self.resetFloodMarkers();
		
		attackStack.push(masterStone);
		masterStone.step = -1;
		var elemWanted = self.colorWonBy(masterStone.element);
		var ownerWanted = 1-masterStone.owner;
		var step = masterStone.step;
		
		while (attackStack.length) {
			var stone = attackStack.shift();
			var ix = stone.ix;
			var iy = stone.iy;
			step = stone.step;
			
			parsePosition(ix-1, iy);
			parsePosition(ix+1, iy);
			parsePosition(ix, iy+1);
			parsePosition(ix, iy-1);
		}
		
		return resultStack;
	}
	
	self.checkAttack  = function(sx,sy) {
		var victimList = self.findAttacks(sx,sy);
		
		var stone = self.board[sx][sy];
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
		self.board[to.ix][to.iy] = {
			ix : to.ix,
			iy : to.iy,
			element : from.element,
			owner : from.owner,
			bgColor : from.bgColor,
			visible : true,
			active : to.active,
		}
		
		if (self.board == GLOBAL.BoardInstance) {
			self.board[to.ix][to.iy].invertedColors = true;
			var delay = to.step*GLOBAL.animationDelay;
			setTimeout(function(){GLOBAL.BoardInstance.startTileAnimation(to.ix, to.iy);}, delay);
			GLOBAL.turnDelay = Math.max(GLOBAL.turnDelay, GLOBAL.animationDelay * (GLOBAL.framesPerStrip+2) + delay);
		}
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
		GLOBAL.counts = [];
		GLOBAL.counts[0] = 0;
		GLOBAL.counts[1] = 0;
		for (var i=0; i<self.board.cols; i++)
			for (var j=0; j<self.board.rows; j++) {
				if (self.board[i][j]) {
					GLOBAL.counts[ self.board[i][j].owner ]++;
				}
			}
	}
}

