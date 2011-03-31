//---------------------------------------------------------------------------------------------
GLOBAL.FloodCheck = function() {
	var self = this;
	
	self.checkFlood = function(ix,iy) {
		self.resetFloodMarkers();
		
		var defended = self.checkDefense(ix, iy);
		if (!defended)
			self.checkAttack(ix, iy);
	}
	
	self.resetFloodMarkers = function() {
		self.floodFill = {}
		for (var i=0;i<GLOBAL.BoardInstance.cols;i++) {
			self.floodFill[i] = {};
			for (var j=0; j<GLOBAL.BoardInstance.rows; j++)
				self.floodFill[i][j] = true;
		}
	}
	
	self.getAttacker = function(ix,iy, stone) {
		var candidate = GLOBAL.BoardInstance.get(ix,iy);
		if (ix>=0 && ix<GLOBAL.BoardInstance.cols && iy>=0 && iy<GLOBAL.BoardInstance.rows &&
			candidate && candidate.owner != stone.owner &&
			self.tileWinsTile(candidate.element, stone.element) )
			return candidate;
		return false;
	}
	
	self.getVictim = function(ix,iy, stone) {
		var candidate = GLOBAL.BoardInstance.get(ix,iy);
		if (ix>=0 && ix<GLOBAL.BoardInstance.cols && iy>=0 && iy<GLOBAL.BoardInstance.rows &&
			candidate && candidate.owner != stone.owner && 
			self.floodFill[ix][iy] && self.tileWinsTile(stone.element, candidate.element) )
			return candidate;
		return false;
	}
	
	self.checkDefense = function(ix, iy) {
		var stone = GLOBAL.BoardInstance.get(ix,iy);
		if (!stone)
			return false;
			
		if (!self.floodFill[ix][iy])
			return false;
			
		var attacker = false;
		
		attacker = self.getAttacker(ix-1,iy, stone);
		if (!attacker)
			attacker = self.getAttacker(ix+1,iy, stone);
		if (!attacker)
			attacker = self.getAttacker(ix,iy-1, stone);
		if (!attacker)
			attacker = self.getAttacker(ix,iy+1, stone);
		
		if (attacker) {
			self.convertStone( attacker, stone );
			return true;
		}
		
		return false;
	}
	
	self.checkAttack = function(sx, sy) {
	
		if (!GLOBAL.BoardInstance.get(sx,sy))
			return;
			
		var attackStack = new Array();
		
		attackStack.push(GLOBAL.BoardInstance.get(sx,sy));
		
		while (attackStack.length) {
			var stone = attackStack.shift();
			var ix = stone.ix;
			var iy = stone.iy;
			
			var victim = self.getVictim(ix-1,iy, stone);
			if (victim) {
				self.convertStone(stone,victim);
				attackStack.push(victim);
			}
			
			victim = self.getVictim(ix+1,iy, stone);
			if (victim) {
				self.convertStone(stone,victim);
				attackStack.push(victim);
			}
			
			victim = self.getVictim(ix,iy-1, stone);
			if (victim) {
				self.convertStone(stone,victim);
				attackStack.push(victim);
			}
			
			victim = self.getVictim(ix,iy+1, stone);
			if (victim) {
				self.convertStone(stone,victim);
				attackStack.push(victim);
			}
		}
	}
	
	self.convertStone = function(from, to) {
		if (!self.floodFill[to.ix][to.iy])
			return;
			
		to.element = from.element;
		to.owner = from.owner;
		to.bgColor = from.bgColor;
		self.floodFill[to.ix][to.iy] = false;
		
		GLOBAL.BoardInstance.startTileAnimation(to.ix, to.iy);
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
				if (GLOBAL.BoardInstance.get(i,j)) {
					GLOBAL.counts[ GLOBAL.BoardInstance.get(i,j).owner - 1 ]++;
				}
			}
	}
}

