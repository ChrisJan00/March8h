//----------------------------------------------------------
function computerPlay() {
	var self = this;
	var pn = GLOBAL.action.turn-1;
	
	self.computeStones = function() {
		self.typeCount = [0,0,0,0];
		self.availableCount = 0;
		
		var pileLimit = GLOBAL.coords.pile[pn].rows*GLOBAL.coords.pile[pn].cols;
		for (var i=0;i<pileLimit; i++)
			if (GLOBAL.pile[pn][i].visible) {
				self.typeCount[GLOBAL.pile[pn][i].element]++;
				self.availableCount++;
			}
	}
	
	self.computeEntropies = function() {
		self.entropies = [0,0,0,0];
		for (var i=0;i<4;i++) {
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
				if (GLOBAL.board[ix][iy])
					continue;
				for (var color=0;color<4;color++) {
					var score = 0;
					if (self.typeCount[color]<=0)
						continue;
					// count defense
					if (self.isDefended(ix, iy, color, pn)) {
						score = -1; // - self.countNeighbours(ix,iy,color, pn+1);
					} else {
						score = 1 + self.countNeighbours(ix,iy,colorWonBy(color),2-pn);
					}
					self.options.push([ix,iy,color,score]);
				}					
			}
	}
	
	self.check = function(x,y,color,owner) {
			if (x>=0 && x<GLOBAL.coords.board.cols && y>=0 && y<GLOBAL.coords.board.rows &&
				GLOBAL.board[x][y] && GLOBAL.board[x][y].element == color && GLOBAL.board[x][y].owner == owner)
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
		var minScore = 0;
		for (var i=0;i<self.options.length;i++) {
			if (self.options[i][3] < minScore)
				minScore = self.options[i][3];
		}
		
		self.totalScore = 0;
		for (var i=0; i<self.options.length;i++) {
			self.options[i][3] += 1 - minScore; // make minimum 1
			self.options[i][3] = Math.pow(self.options[i][3] * self.entropies[self.options[i][2]], 4);
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
		var index = -1;
		while (index<GLOBAL.pile[pn].length) {
			if ((GLOBAL.pile[pn][++index].element == elem) && (GLOBAL.pile[pn][index].visible))
				break;
		}
		
		// undraw stone in player pile
		var stone = GLOBAL.pile[pn][index];
		stone.visible = false;
		stone.bgColor = "#FFFFFF";
		drawStone(stone, pn);
		
		// move stone to board
		var newStone = {
			ix: mix,
			iy: miy,
			bgColor : 0,
			visible : true,
			element: stone.element,
			owner : stone.owner
			};
	 	newStone.bgColor = colorForPlayer(pn);
		drawStone(newStone, 2);
		GLOBAL.board[mix][miy] = newStone;
		
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