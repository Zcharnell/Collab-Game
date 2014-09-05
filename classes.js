/////////////////////
//	Random AI  JS  //
/////////////////////
//	Classes	//



function Unit(tileIn){
	this.currentTile = tileIn;
	this.xLeft = this.currentTile.xLeft;
	this.yTop = this.currentTile.yTop;
	this.ai = false;
	this.width = 30;
	this.height = 30;
	this.xpos = this.xLeft + (this.width/2);
	this.ypos = this.yTop + (this.height/2);
	this.path;
	this.pathEnd;
	this.pathInterval;
	this.currentSprite = unit1;
	this.animateFrame = 0;
	this.direction = 0;  // 0 = left, 1 = right
	this.objHeld = [];
	this.objHeldMax = 2;
	this.name;
	this.currentAction;
	this.currentActionDelay = 0;
	this.xspeed = 6;
	this.yspeed = 6;
}

//Sets the current sprite to use for the unit, based on direction and animation time
Unit.prototype.animate = function(){
	this.animateFrame = (this.animateFrame + 1) % 15;
	// console.log(this.animateFrame);
	if(this.animateFrame === 0){
		if(this.currentSprite === unit1){
			this.currentSprite = unit2;
		}
		else if(this.currentSprite === unit2){
			this.currentSprite = unit1;
		}
		else if(this.currentSprite === unit3){
			this.currentSprite = unit4;
		}
		else if(this.currentSprite === unit4){
			this.currentSprite = unit3;
		}
	}
}

//Changes the sprite for the unit based on a change in direction
Unit.prototype.changeDirection = function(dirIn){
	this.direction = dirIn;
	if(this.direction === 0 && (this.currentSprite === unit3 || this.currentSprite === unit4)){
		if(this.currentSprite === unit3){
			this.currentSprite = unit2;
		}
		else if(this.currentSprite === unit4){
			this.currentSprite = unit1;
		}
	}
	else if(this.direction === 1 && (this.currentSprite === unit1 || this.currentSprite === unit2)){
		if(this.currentSprite === unit2){
			this.currentSprite = unit3;
		}
		else if(this.currentSprite === unit1){
			this.currentSprite = unit4;
		}
	}
}

//Makes the unit wander if there is nothing else to do
Unit.prototype.wander = function(){
	if(this.currentAction === 'wander' && this.currentActionDelay < 10){
		this.currentActionDelay += 1;
	}
	else{
		this.xspeed = 2;
		this.yspeed = 2;
		this.currentAction = 'wander';
		this.currentActionDelay = 0;
		printSideConsole(this.name + ' is WANDERing!');
		var ranTile = squareTiles[Math.floor(Math.random()*squareTiles.length)];
		while(ranTile.impassable || Math.abs(this.currentTile.row - ranTile.row) > 3 || Math.abs(this.currentTile.column - ranTile.column) > 3){
			ranTile = squareTiles[Math.floor(Math.random()*squareTiles.length)];
		}
		var path = pathFind(this.currentTile,ranTile,this);
		moveOnPath(this,path);
	}
}

//Updates the unit's current action, which determines what it is doing and other variables
Unit.prototype.updateAction = function(setAction){
	switch(setAction){
		case 'wander':
			this.wander();
			break;
		case 'gather wood':
			//function for gathering wood should be called from here, will have to update that
			this.xspeed = 6;
			this.yspeed = 6;
			this.currentAction = 'gather wood';
			printSideConsole(this.name + ' is GATHER WOOD');
			//action
			var closestWood = CivMind.getClosestWood(this);
			if(this.currentTile != closestWood){
				var path = pathFind(this.currentTile,closestWood,this);
				moveOnPath(this,path);
			}
			else{
				pickUpObject(this,this.currentTile.objOcc[0]);
			}
			break;
		case 'deposit wood':
			this.xspeed = 6;
			this.yspeed = 6;
			this.currentAction = 'deposit wood';
			printSideConsole(this.name + ' is DEPOSIT WOOD');
			//action
			if(this.currentTile != CivMind.resourceDropOff){
				var path = pathFind(this.currentTile,CivMind.resourceDropOff,this);
				moveOnPath(this,path);
			}
			else{
				dropObject(this,this.objHeld);	
			}
			break;
		case 'build':
			this.xspeed = 6;
			this.yspeed = 6;
			this.currentAction = 'build';
			printSideConsole(this.name + ' is BUILD');
			// console.log(this.name + ' is BUILD');
			CivMind.workerBuilders += 1;
			//action
			if(this.currentTile != curBuildingSpot){
				var path = pathFind(this.currentTile,curBuildingSpot,this);
				moveOnPath(this,path);
			}
			else{
				CivMind.buildStructure(curBuildingSpot);
			}
			break;
	}
}

//Sets the variables referring to the unit's x position
Unit.prototype.setX = function(plusorminus,amount,xLeft){
	switch(plusorminus){
		case '+':
			this.xpos += amount;
			this.xLeft += amount;
			break;
		case '-':
			this.xpos -= amount;
			this.xLeft -= amount;
			break;
		case '=':
			this.xpos = amount;
			this.xLeft = xLeft;
			break;
	}
}

//Sets the variables referring to the unit's y position
Unit.prototype.setY = function(plusorminus,amount,yTop){
	switch(plusorminus){
		case '+':
			this.ypos += amount;
			this.yTop += amount;
			break;
		case '-':
			this.ypos -= amount;
			this.yTop -= amount;
			break;
		case '=':
			this.ypos = amount;
			this.yTop = yTop;
			break;
	}
}




function Wood(tileIn){
	this.currentTile = tileIn;
	this.objIsHeld = false;
	this.xLeft = tileIn.xLeft;
	this.yTop = tileIn.yTop;
	this.xpos = tileIn.xpos;
	this.ypos = tileIn.ypos;
}







//Object for controlling a single civilization of units, like a hivemind
function CivMind(){
	this.woodGathered = 0;
	this.woodForBuild = 5;
	this.woodPosArray = [];
	this.resourceDropOff = squareTiles[20];
	this.woodGatArray = [];
	this.workerArray = [];
	this.unitUpdateOrder = [];
	this.workerEndPathArray = [];
	this.workerSpeed = 6;
	this.workerBuilders = 0;
}

CivMind.prototype.addWorkerToArray = function(workerIn){
	this.workerArray.push(workerIn);
}

//Finds the wood closest to the unit and returns its position
CivMind.prototype.getClosestWood = function(unitIn){
	var u = unitIn;
	var tileArray = this.woodPosArray;
	var curClosest
	var curClosestTile;

	for(var i in tileArray){
		var dist = getDistance(u.currentTile,tileArray[i]);
		var arrayIndex = this.workerEndPathArray.indexOf(tileArray[i]);
		if((arrayIndex < 0 || arrayIndex === this.workerArray.indexOf(u)) && (dist < curClosest || typeof curClosest === 'undefined')){
			curClosest = dist;
			// console.log('GetClosestTile ' + i + ': ' + dist);
			curClosestTile = tileArray[i];
		}
	}

	// console.log('Gettingclosesttile: ' + curClosestTile.row + ',' + curClosestTile.column);
	return curClosestTile;
}

//Builds a structure in the location and removes the resources from storage.
CivMind.prototype.buildStructure = function(tileIn){
	var struct = new Structure(tileIn);
	tileIn.hasStructure = true;
	structArray.push(struct);
	this.resourceDropOff.objOcc.splice(0,6);
	// CivMind.woodGatArray.splice(0,6);
}

//Sets the speed of workers
CivMind.prototype.setWorkerSpeed = function(speedIn){
	for(var i in this.workerArray){
		this.workerArray[i].xspeed = speedIn;
		this.workerArray[i].yspeed = speedIn;
	}
}

//Update function, checks for if any units are currently building
CivMind.prototype.update = function(){
	this.workerBuilders = 0;
	this.unitUpdateOrder = [];
	// for(var i in unitArray){
	// 	if(unitArray[i].currentAction === 'build'){
	// 		CivMind.workerBuilders += 1;
	// 	}
	// }
}









function Structure(tileIn){
	this.currentTile = tileIn;
}








function squareTile(columnIn,rowIn,tileNumIn){
	this.tileNum = tileNumIn;
	this.column = columnIn;
	this.row = rowIn;
	this.height = 30;
	this.width = 30;
	this.xLeft = this.height*this.column;	//topleft side of the tile (where it draws on the canvas)
	this.yTop = this.width*this.row;		//topleft side of the tile (where it draws on the canvas)
	this.xpos = this.xLeft + (this.width/2);	//middle of the tile
	this.ypos = this.yTop + (this.height/2);	//middle of the tile
	this.terrainVariable = 'Grass';	//grass, mountain, river, lake, castle
	this.terrainVariableTile; //determines which tile display should be used; 1, 2, 3, 4, etc
	this.impassable = false;
	this.parentTile;	//pathfinding
	this.astarF;	//pathfinding
	this.astarG;	//pathfinding
	this.astarH;	//pathfinding
	this.adjTiles = [];	//pathfinding
	this.objOcc = [];	//checks if this tile has an object on it
	this.hasStructure = false;
}

//Sets the variable type of the tile, which determines what image is drawn on it and whether it is impassable
squareTile.prototype.setVar = function(varTypeIn){
	this.terrainVariable = varTypeIn;
	if(this.terrainVariable === 'Mountain'){
		this.impassable = true;
	}
	else{
		this.impassable = false;
	}
}

//Sets the tiles adjacent to the tile
squareTile.prototype.setAdjacentTiles = function(){
	var cRow,cCol,tiles;
	cRow = this.row;
	cCol = this.column;
	tiles = [];
	tiles.push(findTile(cRow-1,cCol,'setAdj'));	//Up
	tiles.push(findTile(cRow-1,cCol+1,'setAdj')); //UpRight
	tiles.push(findTile(cRow,cCol+1,'setAdj'));	//Right
	tiles.push(findTile(cRow+1,cCol+1,'setAdj')); //DownRight
	tiles.push(findTile(cRow+1,cCol,'setAdj'));	//Down
	tiles.push(findTile(cRow+1,cCol-1,'setAdj')); //DownLeft
	tiles.push(findTile(cRow,cCol-1,'setAdj'));	//Left
	tiles.push(findTile(cRow-1,cCol-1,'setAdj')); //UpLeft
	for(var i in tiles){
		if(tiles[i] != false && tiles[i].impassable === false){
			this.adjTiles.push(tiles[i]);
		}
	}
}