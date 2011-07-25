G.PlayerManager = function() {
	var self = this;
	
	self.types = [G.playerTypes.human, G.playerTypes.computerEasy, G.playerTypes.none, G.playerTypes.none];
	self.current = 0;
	
	self.init = function() {
		
	}
	
	self.valid = function() {
		return self.count() >= 2;
	}
	
	self.count = function() {
		var cnt = 0;
		for (var i=0; i<self.types.length; i++)
			if (self.types[i] != G.playerTypes.none)
				cnt++;
		return cnt;
	}
	
	// todo: random order, but sequential positioning of piles
	self.next = function() {
		while (self.types[++self.current % self.types.length] == G.playerTypes.none);
		self.current = self.current % self.types.length;
	}
	
	self.rand = function() {
		var n = G.randint(self.count());
		for (var i=0; i<self.types.length; i++)
			if (self.types[i] != G.playerTypes.none && n-- <= 0) {
				self.current = i;
				return i;
			}
	}
	
	self.currentType = function() {
		return self.types[self.current];
	}
	
	self.isHuman = function(pn) {
		if (typeof(pn) == "undefined")
			return self.types[self.current] == G.playerTypes.human;
		else
			return self.types[pn] == G.playerTypes.human;
	}
}