//---------------------------------------------------------------------------------------------
G.FloodCheck = function() {
	var self = this;
	self.board = G.board;
	self.floodMarkers = [];
	
	self.checkFlood = function(ix,iy, board) {
		self.evalBoard(ix,iy,board);
	}
	
	self.evalBoard = function(ix, iy, board) {
		self.board = board || G.board;
		
		if (G.defenseMode) {
			var defended = self.checkDefense(ix, iy);
			if (!defended)
				self.checkAttack(ix, iy);
		} else {
			self.checkAttack(ix, iy);
			self.checkDefense(ix, iy);
		}
	}
	
	self.silentCheckFlood = function(ix, iy, board) {
		var turnDelay = G.turnDelay;
		self.evalBoard(ix,iy,board);
		G.turnDelay = turnDelay;
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
			if (candidate && candidate.owner != ownerAttacked && candidate.element == elemWanted)
				return candidate;
			else
				return false;
		}
		
		var stone = self.board[ix][iy] || fakeStone;
		if (!stone) {
			return false;
		}
		
		var attacker = false;
		var elemWanted = self.colorThatWins(stone.element);
		var ownerAttacked = stone.owner;
		
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
			
			if (self.board == G.board) {
				G.turnDelay = Math.max(G.turnDelay, G.animationDelay * (G.framesPerStrip+2));
				G.board.startTileBlinking(defender.ix, defender.iy);
			}
			return true;
		}
		
		return false;
	}
	
	self.findAttacks = function(sx, sy, fakeStone) {
		function parsePosition(ix,iy, formerOwner) {
			var victim = self.board[ix]?self.board[ix][iy]:null;
			if (victim && victim.owner != ownerAttacker && victim.element == elemWanted && 
				self.floodMarkers[ix][iy]) {
				if ((!G.overflowMode) && formerOwner > -1 && victim.owner != formerOwner)
					return;
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
		var ownerAttacker = masterStone.owner;
		var step = masterStone.step;
		var firstAttack = true;
		
		while (attackStack.length) {
			var stone = attackStack.shift();
			var ix = stone.ix;
			var iy = stone.iy;
			step = stone.step;
			var formerOwner = firstAttack? -1 : stone.formerOwner;

			parsePosition(ix-1, iy, formerOwner);
			parsePosition(ix+1, iy, formerOwner);
			parsePosition(ix, iy+1, formerOwner);
			parsePosition(ix, iy-1, formerOwner);
			firstAttack = false;
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
		self.board = board || G.board;
		return self.findAttacks(x,y, fakeStone).length;
	}
	
	self.countDefenses = function(x,y, board, fakeStone) {
		self.board = board || G.board;
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
			formerOwner : to.owner,
		}
		
		if (self.board == G.board) {
			var delay = to.step*G.animationDelay;
			setTimeout(function(){G.board.startTileAnimation(to.ix, to.iy);}, delay);
			G.turnDelay = Math.max(G.turnDelay, G.animationDelay * (G.framesPerStrip+2) + delay);
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
		G.counts = [];
		G.counts[0] = 0;
		G.counts[1] = 0;
		G.counts[2] = 0;
		G.counts[3] = 0;
		for (var i=0; i<self.board.cols; i++)
			for (var j=0; j<self.board.rows; j++) {
				if (self.board[i][j]) {
					G.counts[ self.board[i][j].owner ]++;
				}
			}
	}
}

