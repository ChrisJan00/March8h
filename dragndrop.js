
G.DragNDrop = function() {
	var self = this;
	self.dragging = false;
	self.stoneData = null;
	
	self.startDrag = function(fromx, fromy, stone, stonex, stoney) {
		self.dragging = true;
		self.drawing = false;
		self.stoneData = stone;
		self.dx = stonex - fromx;
		self.dy = stoney - fromy;
		self.ox = fromx;
		self.oy = fromy;
		self.initialx = fromx;
		self.initialy = fromy;
		self.move(fromx, fromy);
		
		G.gameCanvas.addEventListener('mousemove', self.moveEvent, false);
		G.gameCanvas.addEventListener('mouseup', self.releaseEvent, false);
	}
	
	self.moveEvent = function( ev ) {
		if (self.dragging) {
			G.main.mouseMove(ev);
			self.move(G.mouse.x, G.mouse.y);
		}
	}
	
	self.releaseEvent = function( ev ) {
		if (self.dragging) {
			G.main.mouseMove(ev);
			self.release(G.mouse.x, G.mouse.y);
			self.dragging = false;
			G.gameCanvas.removeEventListener('mousemove', self.moveEvent, false);
			G.gameCanvas.removeEventListener('mouseup', self.releaseEvent, false);
		}
	}
	
	self.move = function( x, y ) {
		if (!self.drawing) {
			var dx = x - self.initialx;
			var dy = y - self.initialy;
			var dmin = G.board.side/4;
			if (dx*dx+dy*dy < dmin*dmin)
				return;
			self.drawing = true;
		}
		
		self.undrawStone( );
		self.ox = x + self.dx;
		self.oy = y + self.dy;
		self.drawStone(x,y);
		G.graphicsManager.redraw();
	}
	
	self.release = function( x, y ) {
		self.undrawStone();
		G.graphicsManager.redraw();
		
		if (G.board.isClicked(x, y))
			G.main.manageTurn();
	}
	
	self.drawStone = function(x,y) {
		var ctxt = G.graphicsManager.dragContext;
		
		var side = G.board.side;
		var mx = x + self.dx;
		var my = y + self.dy;
		
		var bgColor = G.Piles[self.stoneData.owner].cellColor(0);
		var borderColor = G.display.colorForPlayerBorder(self.stoneData.owner);
		// draw background
		ctxt.fillStyle = bgColor;
		ctxt.fillRect(mx, my, side, side);

		// draw borders
		ctxt.fillStyle = borderColor;
		ctxt.fillRect(mx, my, side, 1);
		ctxt.fillRect(mx, my+1, 1, side-2);
		ctxt.fillRect(mx+side-1, my+1, 1, side-2);
		ctxt.fillRect(mx, my+side-1, side, 1);
		
		// draw icon
		var img;
		switch (self.stoneData.element) {
			case 0:	img = G.imageFire;
				break;
			case 1:	img = G.imageEarth;
				 break;
			case 2:	img = G.imageWater;
				 break;
			case 3:	img = G.imageWind;
				 break;
		}
		
		ctxt.drawImage(img, mx, my);
		G.graphicsManager.mark(mx, my, G.board.side, side);
	}
	
	self.undrawStone = function() {
		G.graphicsManager.dragContext.clearRect(self.ox, self.oy, G.board.side, G.board.side);
		G.graphicsManager.mark(self.ox, self.oy, G.board.side, G.board.side);
	}
	
}
