//----------------------------------------------------------
function computerPlay() {
	var self = this;
	var pn = GLOBAL.action.turn;
	var decisionExp = 5;
	
	self.availableCount = GLOBAL.Piles[pn].stoneCount;
	
	self.computeStones = function() {
		self.typeCount = GLOBAL.Piles[pn].countStoneTypes();
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
		for (var ix=0;ix<GLOBAL.BoardInstance.cols;ix++)
			for (var iy=0;iy<GLOBAL.BoardInstance.rows;iy++) {
				if (GLOBAL.BoardInstance[ix][iy])
					continue;
				for (var color=0;color<4;color++) {
					var score = 0;
					if (self.typeCount[color]<=0)
						continue;
					if (GLOBAL.maximizeEntropy && self.typeCount[color]<self.maxCount)
						continue;
					// rate move
					if (GLOBAL.defenseMode) {
						if (self.isDefended(ix, iy, color, pn)) {
							score = 0;
						} else {
							score = 1 + self.countAttacks(ix,iy,color,pn);
						}
					} else {
						var threshold = 10
						score = threshold + self.countAttacks(ix,iy,color,pn);
						if (self.isDefended(ix,iy,color,pn)) {
							score -= threshold;
						}
					}
					
					score += 1;
					self.options.push([ix,iy,color,score]);
				}					
			}
	}
	
	self.check = function(x,y,color,owner) {
		var candidate = GLOBAL.BoardInstance[x]?GLOBAL.BoardInstance[x][y]:null;
		if ( candidate && candidate.element == color && candidate.owner == owner)
			return true;
		else return false;
	}
	
	self.isDefended = function( ix, iy, color, owner )
	{
		// returns true if there is a neighbouring enemy tile that kills this one
		var attackColor = GLOBAL.floodCheck.colorThatWins(color);
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
		
		return GLOBAL.floodCheck.countAttacks(x,y, GLOBAL.BoardInstance, fakeStone);
	}
	
	self.normalizeScores = function() 
	{	
		self.totalScore = 0;
		for (var i=0; i<self.options.length;i++) {
			//self.options[i][3] = Math.pow((self.options[i][3]+1) * self.entropies[self.options[i][2]] * 0.5, decisionExp);
			if (GLOBAL.maximizeEntropy) {
				self.options[i][3] *= self.typeCount[self.options[i][2]];
			}
			self.options[i][3] = Math.pow(self.options[i][3], decisionExp);
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

function computerMove(mix,miy,elem, pn) {
		// find one stone in own pile
		
		var currentPile = GLOBAL.Piles[pn];
		
		//currentPile.selection = GLOBAL.Piles[pn].getStoneByElement(elem);
		var stone = currentPile.getStoneByElement(elem);
		currentPile.del(stone.ix, stone.iy);
		currentPile.redrawTile(stone.ix, stone.iy);
		stone.active = true;

		
		GLOBAL.BoardInstance.set(mix,miy,stone);
		GLOBAL.BoardInstance.redrawTile(mix,miy);
		
		GLOBAL.BoardInstance.startBorderAnimation(mix,miy);
	
		//startFlood(mix, miy);
		GLOBAL.floodCheck.checkFlood(mix, miy);
		
		return true;
	}