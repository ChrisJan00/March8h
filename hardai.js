
var AiWorker = self;
//var AiWorker = {};
AiWorker.onmessage = function(event) {
	var msg = event.data;
	switch(event.data[0])
	{
		case 0: {// board size
			// data[1] contains [cols, rows];
			AlphaBeta.setBoardSize(event.data[1]);
			break;
		}
		case 1: {// pile contents
			// data[1] containts list of two piles, each as [elem1,elem2,elem3,elem4]
			AlphaBeta.setPileContents(event.data[1])
			break;
		}
		case 2: { // start game
			floodCheck.defenseMode = event.data[1];
			AlphaBeta.start();
			break;
		}
		case 3: {// player played
			// x, y, element, player (=0)
			AlphaBeta.reportPlayed(event.data[1], event.data[2], event.data[3], event.data[4]);
			break;
		}
		case 4: { // request move
			var choice = AlphaBeta.computerPlay();
			AiWorker.postMessage(choice);
			break;
		}
	}	
}

//AiWorker.postMessage = function(data) {
//		GLOBAL.computerChoice = data;
//		setTimeout(manageTurn, 1500);
//}

floodCheck = new function() {
	var self = this;
	self.board = [];
	self.floodMarkers = [];
	self.defenseMode = false;
	
	self.checkFlood = function(ix, iy, board) {
		self.board = board;
		
		if (self.defenseMode) {
			var defended = self.checkDefense(ix, iy);
			if (!defended)
				self.checkAttack(ix, iy);
		} else {
			self.checkAttack(ix, iy);
			self.checkDefense(ix, iy);
		}
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
		self.board = board;
		return self.findAttacks(x,y, fakeStone).length;
	}
	
	self.countDefenses = function(x,y, board, fakeStone) {
		self.board = board;
		return self.findDefender(x,y, fakeStone)?1:0;
	}
	
	self.convertStone = function(from, to) {
		to.element = from.element;
		to.owner = from.owner;
		to.bgColor = from.bgColor;
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

}

AlphaBeta = new function() {
	var self = this;
	self.hashedNodes = [];
	self.pIndex = 1;
	self.currentNode = 0; //self.generateRootNode();
	self.rows = 6;
	self.cols = 6;
	self.useCache = false;
	
	self.cloneBoard = function(oldClone) {
		var newClone = [];
		newClone.rows = self.rows;
		newClone.cols = self.cols;
		for (var i=0;i<self.cols;i++) {
			for (var j=0; j<self.rows; j++) {
				var stone = oldClone[i] && oldClone[i][j];
				if (stone) {
					if (!newClone[i]) newClone[i] = [];
					newClone[i][j] = {
						ix: stone.ix,
						iy: stone.iy,
						owner: stone.owner,
						element: stone.element
					};
				}
			}
		}
		return newClone;
	}
	
	self.evaluateNode = function(node) {
		// new heuristic: consider entropy
		if (node.score)
			return;
			
		var clone = node.clone;
		var score = 0;
		for (var x=0;x<self.cols;x++)
			for (var y=0; y<self.rows; y++) {
				var stone = node.clone[x]?node.clone[x][y]:false;
				if (stone)
					score += (stone.owner == self.pIndex? 1 : -1);
				}
		node.score = score;
		
		// uncomment this for disabling entropy evaluation:
		return;
			
		// entropy combination
		var entropies = [0,0];
		var totalPieces = [0,0];
		for (var i=0;i<4;i++) {
			totalPieces[0] += node.piles[0][i];
			totalPieces[1] += node.piles[1][i];
		}
		for (var i=0;i<4;i++) {
			if (node.piles[0][i]>0) {
				var px = node.piles[0][i]/totalPieces[0];
				entropies[0] -= px*Math.log(px)/Math.log(2);
			}
			if (node.piles[1][i]>0) {
				var px = node.piles[1][i]/totalPieces[1];
				entropies[1] -= px*Math.log(px)/Math.log(2);
			}
		}
		
		var entropyScore = (entropies[self.pIndex]-entropies[1-self.pIndex]) * self.maxTurns / 2;
	
		// entropy balance now counts 50%
		node.score = score + entropyScore;
	}
	
	
	self.alphabeta = function(node, depth, alpha, beta, player) {
		if (depth==0 || node.turn == 0) {
			self.evaluateNode(node);
			return [node];
		}

		var sequence = [];
		var childrenFactory = new self.nodeFactory(node);
		var child;
		
		if (player == self.pIndex) {
			while(childrenFactory.next()) {
				child = childrenFactory.current();
				
				var candidateSeq = self.alphabeta(child, depth-1, alpha, beta, 1-player)
				var seqScore = candidateSeq[0].score;
				if (alpha < seqScore) {
					alpha = seqScore;
					sequence = candidateSeq;
				}
				
				if (beta<=alpha)
					break;
			}
			
		} else {
			while(childrenFactory.next()) {
				child = childrenFactory.current();
				
				var candidateSeq = self.alphabeta(child, depth-1, alpha, beta, 1-player);
				var seqScore = candidateSeq[0].score;
				if (beta > seqScore) {
					beta = seqScore;
					sequence = candidateSeq;
				}
				
				if (beta>=alpha)
					break;
			}
		} 
		sequence.push(node);
		return sequence.slice();
	}
	
	self.computerPlay = function() {
		var winningSequence = self.alphabeta(self.currentNode, self.depthEstimation(self.currentNode.turn), 
			-self.maxTurns-1, self.maxTurns+1, self.pIndex);
		var chosenNode;
		if (winningSequence.length<2)
			chosenNode = winningSequence[0];
		else
			chosenNode = winningSequence[winningSequence.length-2];
		self.reportPlayed(chosenNode.x, chosenNode.y, chosenNode.element, self.pIndex);
		
		return [chosenNode.x, chosenNode.y, chosenNode.element];
	}
	
	self.nodeFactory = function(parent)
	{
		var factory = this;
		factory.baseNode = parent;
		factory.x = parent.initialX;
		factory.y = parent.initialY;
		factory.turn = parent.turn-1;
		factory.player = 1-parent.player;
		factory.element = 0;
		factory.lastNode = false;
		
		
		factory.increasePosition = function() {
			// next position
			factory.x++;
			if (factory.x >= self.cols) {
				factory.x = 0;
				factory.y++;
				if (factory.y >= self.rows) {
					return false;
				}
			}
			return true;
		}
		
		factory.findStart = function() {
			while (factory.baseNode.piles[factory.player][factory.element]<=0)
			{
				if (!factory.increaseElement())
					return;
			}
			
			while (factory.baseNode.clone[factory.x] && factory.baseNode.clone[factory.x][factory.y]) {
				if (!factory.increasePosition())
					return;
			}
			
			factory.baseNode.initialElement = factory.element;
			factory.baseNode.initialX = factory.x;
			factory.baseNode.initialY = factory.y;
		}
		
		factory.increaseElement = function() {
			factory.element++;
			if (factory.element>=4)
				return false;
			return true;
		}
		
		factory.next = function() {
			if (factory.element >= 4)
				return false;
				
			factory.lastNode = self.getFromCache(factory.x, factory.y, 
			factory.element, factory.turn, factory.player, factory.baseNode);
				
			// find an empty position
			do {
				if (!factory.increasePosition()) do {
					if (!factory.increaseElement())
						return true;
					else {
						factory.x = factory.baseNode.initialX;
						factory.y = factory.baseNode.initialY;
					}		
				} while (factory.baseNode.piles[factory.player][factory.element]<=0);
			} while (factory.baseNode.clone[factory.x] && factory.baseNode.clone[factory.x][factory.y]);
			
			return true;
		}
		
		factory.nextNoCreate = function() {
			if (!self.useCache)
				return false;
			var retval = false;
			while (true) {
				
				if (factory.element >= 4)
					return false;
					
				var hash = self.getHashFor(factory.x, factory.y, factory.element, factory.turn, factory.baseNode.hash);
				if (self.hashedNodes[hash]) {
					factory.lastNode =  self.hashedNodes[hash];
					retval = true;
				}
				
				// find an empty position
				do {
					if (!factory.increasePosition()) do {
						if (!factory.increaseElement())
							return retval;
						else {
							factory.x = factory.baseNode.initialX;
							factory.y = factory.baseNode.initialY;
						}		
					} while (factory.baseNode.piles[factory.player][factory.element]<=0);
				} while (factory.baseNode.clone[factory.x] && factory.baseNode.clone[factory.x][factory.y]);
				if (retval)
					return true;
			}
		}
		
		factory.current = function() {
			return factory.lastNode;
		}
		
		factory.findStart();
	}
	
	self.getFromCache = function(_x, _y, _element, _turn, _player, _parentNode) {
		if (self.useCache) {
			var hash = self.getHashFor(_x, _y, _element, _turn, _parentNode.hash);
			if (self.hashedNodes[hash]) {
				return self.hashedNodes[hash];
			}
		}
		
		// create node
		var node = {
			x : _x,
			y : _y,
			turn : _turn,
			element : _element,
			player : _player,
			initialElement : _parentNode.initialElement,
			initialX : _parentNode.initialX,
			initialY : _parentNode.initialY
		}
		
		node.clone = self.cloneBoard(_parentNode.clone);
		
		if (!node.clone[_x])
			node.clone[_x] = [];
		node.clone[_x][_y] = {
			ix : _x,
			iy : _y,
			element : _element,
			owner : _player,
		};
		
		floodCheck.checkFlood(_x, _y, node.clone);
		node.piles = self.clonePiles(_parentNode.piles);
		node.piles[_player][_element]--;

		if (self.useCache) {
			node.hash = hash;	
			self.hashedNodes[hash] = node;
		}
		return node;
	}
	
	self.getHashFor = function(x, y, element, turn, parentHash) {
		if (!self.useCache) return 0;
		var hash = turn;
		hash = (hash*self.cols) + x;
		hash = (hash*self.rows) + y;
		hash = (hash * 4) + element;
		
		var hashList;
		
		if (parentHash)
		{
			hashList = parentHash.slice();
			hashList.push(hash);
		} else {
			hashList = [hash];
		}
		return hashList;
	}
	
	self.pruneHash = function(parentNode, survivor) {
		var iterator = new self.nodeFactory(parentNode);
		while (iterator.nextNoCreate()) {
			var toDelete = iterator.current();
			if ((!survivor) || toDelete.hash != survivor.hash) {
				self.pruneHash(toDelete, false);
				self.hashedNodes[toDelete.hash] = null;
			}
		}
	}
	
	// get the root node
	self.generateRootNode = function() {
		var rootNode = {
				x : 0,
				y : 0,
				turn : self.maxTurns,
				element : 0,
				player : 1,
				initialElement : 0,
				initialX : 0,
				initialY : 0
			}
		rootNode.clone = [];
		rootNode.piles = self.piles;
		return rootNode;
	}
	
	// todo: fix the prunning loop
	self.reportPlayed = function(x,y,element,player) {
		var oldNode = self.currentNode;
		// find the child in the cache
		var newNode = self.getFromCache(x,y,element,oldNode.turn-1, player, oldNode);
		if (self.useCache) {
			self.pruneHash(oldNode, newNode);
			self.hashedNodes[oldNode.hash] = null;
		}
		self.currentNode = newNode;
	}
	
	self.depthEstimation = function(turn) {
		//return Math.max(2, Math.min( 10, Math.floor(14 * Math.exp(-turn/28.0) ) ) );
		//return 3;
		//var baseEstimation = Math.floor(14 * Math.exp(-turn/9));
		var baseEstimation = Math.floor(17 * Math.exp(-turn/13));
		var enhanced = 2*baseEstimation + 1;
		//var baseEstimation = Math.floor(28 * Math.exp(-turn/9)+1);
		return (Math.max(1, Math.min(13, enhanced)));
		//return Math.max(2, Math.min( 14, Math.floor(75 * Math.exp(-turn/9.0) ) ) );
	}
	
	self.clonePiles = function(parentPiles) {
		var pileCount = [];
		for (var pileNum=0;pileNum<2; pileNum++) {
			pileCount[pileNum] = parentPiles[pileNum].slice();
		}
		return pileCount;
	}
	
	self.setBoardSize = function(data) {
		self.rows = data[1];
		self.cols = data[0];
	}
	
	self.setPileContents = function(data) {
		self.piles = data;
	}
	
	self.start = function() {
		self.maxTurns = self.cols * self.rows;
		self.hashSize = self.maxTurns * self.maxTurns * 4;
		self.hashedNodes = [];
		self.currentNode = self.generateRootNode();
	}

}

