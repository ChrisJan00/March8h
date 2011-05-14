
GLOBAL.DragNDrop = function() {
	var self = this;
	self.dragging = false;
	self.stoneData = null;
	
	self.snapCanvas = document.createElement('canvas');
	self.snapCanvas.width = GLOBAL.gameCanvas.width;
	self.snapCanvas.height = GLOBAL.gameCanvas.height;
	
	self.startDrag = function(fromx, fromy, stone, stonex, stoney) {
		self.snapContext = self.snapCanvas.getContext("2d");
		self.snapContext.drawImage(GLOBAL.gameCanvas, 0, 0, GLOBAL.canvasWidth, GLOBAL.canvasHeight);

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
		
		GLOBAL.gameCanvas.addEventListener('mousemove', self.moveEvent, false);
		GLOBAL.gameCanvas.addEventListener('mouseup', self.releaseEvent, false);
	}
	
	self.moveEvent = function( ev ) {
		if (self.dragging) {
			mouseMove(ev);
			self.move(GLOBAL.mouse.x, GLOBAL.mouse.y);
		}
	}
	
	self.releaseEvent = function( ev ) {
		if (self.dragging) {
			mouseMove(ev);
			self.release(GLOBAL.mouse.x, GLOBAL.mouse.y);
			self.dragging = false;
			GLOBAL.gameCanvas.removeEventListener('mousemove', self.moveEvent, false);
			GLOBAL.gameCanvas.removeEventListener('mouseup', self.releaseEvent, false);
		}
	}
	
	self.move = function( x, y ) {
		if (!self.drawing) {
			var dx = x - self.initialx;
			var dy = y - self.initialy;
			var dmin = GLOBAL.BoardInstance.side/4;
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
		
		if (GLOBAL.BoardInstance.isClicked(x, y))
			manageTurn();
	}
	
	self.drawStone = function(x,y) {
		var side = GLOBAL.BoardInstance.side;
		var mx = x + self.dx;
		var my = y + self.dy;
		
		var bgColor = GLOBAL.Piles[self.stoneData.owner].cellColor(0);
		var borderColor = colorForPlayerLegend(self.stoneData.owner);
		// draw background
		GLOBAL.gameContext.fillStyle = bgColor;
		GLOBAL.gameContext.fillRect(mx, my, side, side);
		
		// draw borders
		GLOBAL.gameContext.fillStyle = borderColor;
		GLOBAL.gameContext.fillRect(mx, my, side, 1);
		GLOBAL.gameContext.fillRect(mx, my+1, 1, side-2);
		GLOBAL.gameContext.fillRect(mx+side-1, my+1, 1, side-2);
		GLOBAL.gameContext.fillRect(mx, my+side-1, side, 1);
		
		// draw icon
		var img;
		switch (stone.element) {
			case 0:	img = GLOBAL.imageFire;
				break;
			case 1:	img = GLOBAL.imageEarth;
				 break;
			case 2:	img = GLOBAL.imageWater;
				 break;
			case 3:	img = GLOBAL.imageWind;
				 break;
		}
			
		GLOBAL.gameContext.drawImage(img, mx, my);
	}
	
	self.undrawStone = function() {
		var x = self.ox;
		var y = self.oy;
		var sx = GLOBAL.BoardInstance.side;
		var sy = GLOBAL.BoardInstance.side;
		if (x<0) x = 0;
		if (y<0) y = 0;
		if (x+sx > GLOBAL.canvasWidth) sx = GLOBAL.canvasWidth - x;
		if (y+sy > GLOBAL.canvasHeight) sy = GLOBAL.canvasHeight - y;
		
		if (sx<1 || sy<1) return;
		
		GLOBAL.gameContext.drawImage(self.snapCanvas, x, y, sx, sy, x, y, sx, sy);
	}
	
}
