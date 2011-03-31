//----------------------------------------------------------
function computerPlay() {
	var self = this;
	var pn = GLOBAL.action.turn-1;
	var decisionExp = 5;
	
	maximizeEntropy = false;
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
		for (var ix=0;ix<GLOBAL.coords.board.cols;ix++)
			for (var iy=0;iy<GLOBAL.coords.board.rows;iy++) {
				if (GLOBAL.BoardInstance.get(ix,iy))
					continue;
				for (var color=0;color<4;color++) {
					var score = 0;
					if (self.typeCount[color]<=0)
						continue;
					if (maximizeEntropy && self.typeCount[color]<self.maxCount)
						continue;
					// count defense
					if (self.isDefended(ix, iy, color, pn)) {
						score = 0; // - self.countNeighbours(ix,iy,color, pn+1);
					} else {
						score = 1 + self.countNeighbours(ix,iy,colorWonBy(color),2-pn);
					}
					self.options.push([ix,iy,color,score]);
				}					
			}
	}
	
	self.check = function(x,y,color,owner) {
			if (x>=0 && x<GLOBAL.coords.board.cols && y>=0 && y<GLOBAL.coords.board.rows &&
				GLOBAL.BoardInstance.get(x,y) && 
				GLOBAL.BoardInstance.get(x,y).element == color && 
				GLOBAL.BoardInstance.get(x,y).owner == owner)
					return true;
			else return false;
		}
	
	self.isDefended = function( ix, iy, color, owner )
	{
		// returns true if there is a neighbouring enemy tile that kills this one
		var attackColor = colorThatWins(color);
		return  self.check(ix-1, iy, attackColor, owner) ||
				self.check(ix+1, iy, attackColor, owner) ||
				self.check(ix, iy-1, attackColor, owner) ||
				self.check(ix, iy+1, attackColor, owner);
	}
	
	self.countNeighbours = function( x, y, color, owner)
	{
		// finds neighbours of this position with this color and owner
		var neighbourPile = new Array();
		var localMap = [];
		for (var i=0;i<GLOBAL.coords.board.cols; i++) {
			localMap[i] = [];
			for (var j=0;j<GLOBAL.coords.board.rows; j++) {
				localMap[i][j] = true;
			}
		}
		var count = 0;
		neighbourPile.push([x,y]);
		
		function checkNeighHelper(ix,iy) {
			if (self.check(ix,iy,color,owner) && localMap[ix][iy]) {
				count++;
				neighbourPile.push([ix,iy]);
				localMap[ix][iy] = false;
			}
		}
		
		while (neighbourPile.length>0) {
			var pos = neighbourPile.shift();
			var ix = pos[0];
			var iy = pos[1];
			checkNeighHelper(ix-1,iy);
			checkNeighHelper(ix+1,iy);
			checkNeighHelper(ix,iy-1);
			checkNeighHelper(ix,iy+1);
		}
		return count;
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
	
	self.playThis = function(mix,miy,elem) {
		// find one stone in own pile
		
		var currentPile = GLOBAL.Piles[pn];
		
		//currentPile.selection = GLOBAL.Piles[pn].getStoneByElement(elem);
		var stone = currentPile.getStoneByElement(elem);
		currentPile.del(stone.ix, stone.iy);
		currentPile.redrawTile(stone.ix, stone.iy);
		stone.active = true;

		
		GLOBAL.BoardInstance.set(mix,miy,stone);
		GLOBAL.BoardInstance.redrawTile(mix,miy);
		
		startFlood(mix, miy);
		
		countMarkers();
		
		if (--GLOBAL.stoneCount) {
			showPlayer();
		} else {
			checkVictory();
		}
		
	}
	
	
	self.computeStones();
	self.computeEntropies();
	self.computeBasicScores();
	self.normalizeScores();
	var finalChoice = self.chooseOption();
	self.playThis(finalChoice[0], finalChoice[1], finalChoice[2]);
	
}