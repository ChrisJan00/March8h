//----------------------------------------------------------
G.computerPlay = function() {
	var self = this;
	var pn = G.playerManager.currentId();
	var decisionExp = 5;
	
	if (pn == -1)
		return [-1, -1, -1];
	
	self.maximizeEntropy = G.playerManager.currentType() == G.playerTypes.computerHard;
	self.availableCount = G.Piles[pn].stoneCount;
	
	self.computeStones = function() {
		self.typeCount = G.Piles[pn].countStoneTypes();
	}
	
	self.computeEntropies = function() {
		self.entropies = [0,0,0,0];
		self.maxCount = 0;
		for (var i=0;i<4;i++) {
			if (self.typeCount[i]>self.maxCount)
				self.maxCount = self.typeCount[i];
			self.typeCount[i]--;
			for (var j=0;j<4;j++)
				if (self.typeCount[j]>0) {
					var px = self.typeCount[j]/self.availableCount;
					self.entropies[i] -= px*Math.log(px)/Math.log(2);
				}
			self.typeCount[i]++;
		}
	}
	
	self.computeBasicScores = function() {
		self.options = new Array();
		for (var ix=0;ix<G.board.cols;ix++)
			for (var iy=0;iy<G.board.rows;iy++) {
				if (G.board[ix][iy])
					continue;
				if (G.board.hasHole(ix,iy))
					continue;
				for (var color=0;color<4;color++) {
					var score = 0;
					if (self.typeCount[color]<=0)
						continue;
					if (self.maximizeEntropy && self.typeCount[color]<self.maxCount)
						continue;
					// rate move
					if (G.defenseMode) {
						if (self.isDefended(ix, iy, color, pn)) {
							score = 0;
						} else {
							score = 4 + self.countAttacks(ix,iy,color,pn);
						}
					} else {
						score = 1 + self.countAttacks(ix,iy,color,pn);
						if (self.isDefended(ix,iy,color,pn)) {
							score--;
						}
					}
					self.options.push([ix,iy,color,score]);
				}					
			}
	}
	
	self.check = function(x,y,color,owner) {
		var candidate = G.board[x]?G.board[x][y]:null;
		if ( candidate && candidate.element == color && candidate.owner == owner)
			return true;
		else return false;
	}
	
	self.isDefended = function( ix, iy, color, owner )
	{
		// returns true if there is a neighbouring enemy tile that kills this one
		var attackColor = G.floodCheck.colorThatWins(color);
		return  self.check(ix-1, iy, attackColor, owner) ||
				self.check(ix+1, iy, attackColor, owner) ||
				self.check(ix, iy-1, attackColor, owner) ||
				self.check(ix, iy+1, attackColor, owner);
	}
	
	self.countAttacks = function( x, y, color, _owner )
	{
		var fakeStone = {
			ix : x,
			iy : y,
			owner : _owner,
			element : color
		}
		
		return G.floodCheck.countAttacks(x,y, G.board, fakeStone);
	}
	
	self.normalizeScores = function() 
	{	
		self.totalScore = 0;
		for (var i=0; i<self.options.length;i++) {
			self.options[i][3] = Math.pow((self.options[i][3]+1) * self.entropies[self.options[i][2]] * 0.5, decisionExp);
			self.totalScore += self.options[i][3];
		}
	}
	
	self.chooseOption = function() {
		var prob = Math.random() * self.totalScore;
		var choice = -1;
		while (prob>0) {
			choice++;
			prob -= self.options[choice][3];
		}
		if (choice<0)
			choice = 0;
		if (choice >= self.options.length)
			choice = self.options.length-1;
			
		return self.options[choice];
	}
	
	
	self.computeStones();
	self.computeEntropies();
	self.computeBasicScores();
	self.normalizeScores();
	return self.chooseOption();
	//var finalChoice = self.chooseOption();
	//return self.playThis(finalChoice[0], finalChoice[1], finalChoice[2]);
	
}

G.computerMove = function(mix,miy,elem) {
		if (elem == -1)
			return false;
		
		// find one stone in own pile
		var currentPile = G.Piles[G.playerManager.currentId()];
		
		var stone = currentPile.getStoneByElement(elem);
		var stoneIndex = stone.ix * currentPile.rows + stone.iy;
		currentPile.del(stone.ix, stone.iy);
		currentPile.redrawTile(stone.ix, stone.iy);
		stone.active = true;

		
		G.board.set(mix,miy,stone);
		G.board.redrawTile(mix,miy);
		
		G.board.startBorderAnimation(mix,miy);
		
		G.gameLog.registerMove(G.playerManager.currentId(), stone, stoneIndex);
	
		//startFlood(mix, miy);
		G.floodCheck.checkFlood(mix, miy);
		
		//G.board.refreshTileBorders(mix, miy);
		G.board.refreshTileBordersExpansive(mix, miy);
		
		return true;
	}