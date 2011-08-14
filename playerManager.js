G.PlayerManager = function() {
	var self = this;
	
	self.types = [G.playerTypes.human, G.playerTypes.computerEasy, G.playerTypes.none, G.playerTypes.none];
	self.order = [];
	self.current = 0;
	
	self.init = function() {
		
	}
	
	self.valid = function() {
		return self.count() >= 2;
	}
	
	self.count = function() {
		if (self.order.length > 0)
			return self.order.length;
		
		var cnt = 0;
		for (var i = 0; i < self.types.length; i++)
			if (self.types[i] != G.playerTypes.none)
				cnt++;
		return cnt;
	}
	
	self.next = function() {
		self.current = (self.current+1) % self.order.length;
	}
	
	self.rand = function() {
		// random sort
		self.order = [];
		var playerStack = [];
		
		for (var i = 0; i<self.types.length; i++)
			if (self.types[i] != G.playerTypes.none)
				playerStack.push(i);
		
		while (playerStack.length > 0) {
			self.order.push(playerStack.splice(G.randint(playerStack.length),1)[0]);
		}
		
		self.current = 0;
	}
	
	self.currentId = function() {
		return self.order[self.current];
	}
	
	self.idForOrder = function(id) {
		return self.order[id];
	}
	
	self.setCurrentId = function(id) {
		for (var i = 0; i < self.order.length; i++)
			if (self.order[i] == id) {
				self.current = i;
				break;
			}
	}
	
	self.currentType = function() {
		return self.types[self.order[self.current]];
	}
	
	self.isHuman = function(pn) {
		if (typeof(pn) == "undefined")
			return self.types[self.order[self.current]] == G.playerTypes.human;
		else
			return self.types[self.order[pn]] == G.playerTypes.human;
	}
	
	self.isVisible = function(id) {
		return self.types[id] != G.playerTypes.none;
	}
	
	self.typeName = function(pn) {
		var ptype;
		switch (self.types[pn]) {
			case G.playerTypes.none: ptype = G.strings.noplayer; break;
			case G.playerTypes.human: ptype =  G.strings.human; break;
			case G.playerTypes.computerEasy: ptype =  G.strings.computerEasy; break;
			case G.playerTypes.computerHard: ptype =  G.strings.computerHard; break;
		}
		return G.display.playerNameForIndex(pn)+":"+ptype;
	}
	
	self.increaseType = function(pn) {
		self.types[pn] = (self.types[pn] + 1) % 4;
	}
}