
G.DragNDrop = function() {
	var self = this;
	self.dragging = false;
	self.stoneData = null;
	
	self.snapCanvas = document.createElement('canvas');
	self.snapCanvas.width = G.gameCanvas.width;
	self.snapCanvas.height = G.gameCanvas.height;
	
	self.startDrag = function(fromx, fromy, stone, stonex, stoney) {
		self.snapContext = self.snapCanvas.getContext("2d");
		self.snapContext.drawImage(G.gameCanvas, 0, 0, G.canvasWidth, G.canvasHeight);

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
	}
	
	self.release = function( x, y ) {
		self.undrawStone();
		
		if (G.board.isClicked(x, y))
			G.main.manageTurn();
	}
	
	self.drawStone = function(x,y) {
		var side = G.board.side;
		var mx = x + self.dx;
		var my = y + self.dy;
		
		var bgColor = G.Piles[self.stoneData.owner].cellColor(0);
		var borderColor = G.display.colorForPlayerLegend(self.stoneData.owner);
		// draw background
		G.gameContext.fillStyle = bgColor;
		G.gameContext.fillRect(mx, my, side, side);
		
		// draw borders
		G.gameContext.fillStyle = borderColor;
		G.gameContext.fillRect(mx, my, side, 1);
		G.gameContext.fillRect(mx, my+1, 1, side-2);
		G.gameContext.fillRect(mx+side-1, my+1, 1, side-2);
		G.gameContext.fillRect(mx, my+side-1, side, 1);
		
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
			
		G.gameContext.drawImage(img, mx, my);
	}
	
	self.undrawStone = function() {
		var x = self.ox;
		var y = self.oy;
		var sx = G.board.side;
		var sy = G.board.side;
		if (x<0) x = 0;
		if (y<0) y = 0;
		if (x+sx > G.canvasWidth) sx = G.canvasWidth - x;
		if (y+sy > G.canvasHeight) sy = G.canvasHeight - y;
		
		if (sx<1 || sy<1) return;
		
		G.gameContext.drawImage(self.snapCanvas, x, y, sx, sy, x, y, sx, sy);
	}
	
}
