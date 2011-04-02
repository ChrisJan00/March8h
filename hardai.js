// start with element with bigger count?
// start with board that cutted beta before?


GLOBAL.AlphaBeta = function() {
	var self = this;
	self.hashedNodes = [];
	self.pIndex = 1;
	self.maxTurns = GLOBAL.BoardInstance.cols * GLOBAL.BoardInstance.rows;
	self.hashSize = self.maxTurns * self.maxTurns * 4;
	self.currentNode = 0; //self.generateRootNode();
	
	self.BoardClone = function() {};
	self.BoardClone.prototype = {
		get : function(x,y) {
			if (x<0 || x>=GLOBAL.BoardInstance.cols || y<0 || y>=GLOBAL.BoardInstance.rows)
				return false;
			return this[x][y];
			
		},
		set : function(x,y, stone) {
			if (x<0 || x>=GLOBAL.BoardInstance.cols || y<0 || y>=GLOBAL.BoardInstance.rows)
				return;
			this[x][y] = {
				ix: stone.ix,
				iy: stone.iy,
				owner: stone.owner,
				element: stone.element
			}
		}
	}
	
	self.cloneFromMaster = function() {
		var newClone = new self.BoardClone();
		for (var i=0;i<GLOBAL.BoardInstance.cols;i++) {
			newClone[i] = [];
			for (var j=0; j<GLOBAL.BoardInstance.rows; j++)
			{
				var stone = GLOBAL.BoardInstance.get(i,j);
				if (stone)
					newClone.set(i,j, {
						ix : stone.ix,
						iy : stone.iy,
						elem: stone.element,
						owner: stone.owner
					} );
			}
		}
		return newClone;
	}
	
	self.cloneBoard = function(oldClone) {
		var newClone = new self.BoardClone();
		for (var i=0;i<GLOBAL.BoardInstance.cols;i++) {
			newClone[i] = [];
			for (var j=0; j<GLOBAL.BoardInstance.rows; j++)
				if (oldClone.get(i,j))
					newClone.set(i, j, oldClone.get(i,j) );
		}
		return newClone;
	}
	
	self.getEmptyClone = function() {
		var newClone = new self.BoardClone();
		for (var i=0;i<GLOBAL.BoardInstance.cols;i++) {
			newClone[i] = [];
//			for (var j=0; j<GLOBAL.BoardInstance.rows; j++)
//				newClone[i][j] = false;
		}
		return newClone;
	}
	
	self.evaluateNode = function(node) {
		if (node.score)
			return;
			
		var clone = node.clone;
		var score = 0;
		for (var x=0;x<GLOBAL.BoardInstance.cols;x++)
			for (var y=0; y<GLOBAL.BoardInstance.rows; y++) {
				var stone = node.clone.get(x,y);
				if (stone)
					score += (stone.owner == self.pIndex? 1 : -1);
				}
		node.score = score;
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
			if (factory.x >= GLOBAL.BoardInstance.cols) {
				factory.x = 0;
				factory.y++;
				if (factory.y >= GLOBAL.BoardInstance.rows) {
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
			
			while (factory.baseNode.clone.get(factory.x, factory.y)) {
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
			factory.lastNode = self.getFromCache(factory.x, factory.y, 
			factory.element, factory.turn, factory.player, factory.baseNode);
				
			// find an empty position
			do {
				if (!factory.increasePosition()) do {
					if (!factory.increaseElement())
						return false;
					else {
						factory.x = 0;
						factory.y = 0;
					}		
				} while (factory.baseNode.piles[factory.player][factory.element]<=0);
			} while (factory.baseNode.clone.get(factory.x, factory.y));
			
			return true;
		}
		
		factory.nextNoCreate = function() {
			do {
				if (!factory.increasePosition())
					// if we checked all possible, signal end
					return false;
			} while (factory.baseNode.clone.get(factory.x, factory.y));
			
			var hash = self.getHashFor(factory.x, factory.y, factory.element, factory.turn, factory.baseNode.hash);
			if (self.hashedNodes[hash]) {
				factory.lastNode =  self.hashedNodes[hash];
				return true;
			}
			
			return false;
		}
		
		factory.current = function() {
			return factory.lastNode;
		}
		
		factory.findStart();
	}
	
	self.getFromCache = function(_x, _y, _element, _turn, _player, _parentNode) {
		var hash = self.getHashFor(_x, _y, _element, _turn, _parentNode.hash);
		if (self.hashedNodes[hash]) {
			return self.hashedNodes[hash];
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
		node.clone.set(_x, _y, {
			ix : _x,
			iy : _y,
			element : _element,
			owner : _player,
		})
		GLOBAL.floodCheck.silentCheckFlood(_x, _y, node.clone);
		node.piles = self.clonePiles(_parentNode.piles);
		node.piles[_player][_element]--;

		node.hash = hash;	
		// node is ready, store it in the cache and return it
		self.hashedNodes[hash] = node;
		return node;
	}
	
	self.getHashFor = function(x, y, element, turn, parentHash) {
		var hash = turn;
		hash = (hash*GLOBAL.BoardInstance.cols) + x;
		hash = (hash*GLOBAL.BoardInstance.rows) + y;
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
		rootNode.clone = self.getEmptyClone();
		rootNode.piles = self.countPiles();
		return rootNode;
	}
	
	self.reportPlayed = function(x,y,element,player) {
		var oldNode = self.currentNode;
		// find the child in the cache
		var newNode = self.getFromCache(x,y,element,oldNode.turn-1, player, oldNode);
		self.pruneHash(oldNode, newNode);
		self.hashedNodes[oldNode.hash] = null;
		self.currentNode = newNode;
	}
	
	self.depthEstimation = function(turn) {
		//return Math.max(2, Math.min( 10, Math.floor(14 * Math.exp(-turn/28.0) ) ) );
		return 2;
		//return Math.max(2, Math.min( 14, Math.floor(75 * Math.exp(-turn/9.0) ) ) );
	}
	
	self.countPiles = function() {
		var pileCount = [];
		for (var pileNum=0;pileNum<2; pileNum++) {
			pileCount[pileNum] = [0,0,0,0];
			for (var x=0;x<GLOBAL.Piles[pileNum].cols;x++)
				for (var y=0;y<GLOBAL.Piles[pileNum].rows;y++) {
					var stone = GLOBAL.Piles[pileNum].get(x,y);
					if (stone)
						pileCount[pileNum][stone.element]++;
				}
		}
		return pileCount;
	}
	
	self.clonePiles = function(parentPiles) {
		var pileCount = [];
		for (var pileNum=0;pileNum<2; pileNum++) {
			pileCount[pileNum] = parentPiles[pileNum].slice();
		}
		return pileCount;
	}
	
	self.start = function() {
		self.hashedNodes = [];
		self.currentNode = self.generateRootNode();
	}

}

// begin (after piles are full): start()
// tell player: reportPlayed(x,y,element, playernumber)
// ask computer: computerPlay();
