/////////////////////
//	Random AI  JS  //
/////////////////////

//Variable Initialization
var drawTileNumbers,drawTileRowCol,tempTime,pathToDraw,ONE_KEY,TWO_KEY,THREE_KEY,FOUR_KEY,FIVE_KEY,SIX_KEY,SEVEN_KEY,EIGHT_KEY,P_KEY,NUMPAD1,NUMPAD2,xPosi,yPosi,movingOnPath,curBuildingSpot,buildingSpotArray;
drawTileNumbers = false;
drawTileRowCol = false;
tempTime = 0;
pathToDraw = [];
ONE_KEY = 49;
TWO_KEY = 50;
THREE_KEY = 51;
FOUR_KEY = 52;
FIVE_KEY = 53;
SIX_KEY = 54;
SEVEN_KEY = 55;
EIGHT_KEY = 56;
P_KEY = 80;
NUMPAD1 = 97;
NUMPAD2 = 98;
movingOnPath = false;
xPosi = 0;
yPosi = 0;


function gameUpdate(){
	ctx.font = "12px Arial";
	ctx.fillStyle = 'black';
	for(var i = 0; i<squareTiles.length; i++){

		//drawing images on the tiles based on what type of tile they are supposed to be
		if(squareTiles[i].terrainVariable === 'Grass'){
			ctx.drawImage(squareGrass, squareTiles[i].xLeft, squareTiles[i].yTop);
		}
		else if(squareTiles[i].terrainVariable === 'Mountain'){
			ctx.drawImage(squareMountain, squareTiles[i].xLeft, squareTiles[i].yTop);
		}

		//Draws the numbers of the tiles based on their number in the array
		if(drawTileNumbers){
			ctx.fillText(i, squareTiles[i].xpos-5, squareTiles[i].ypos-5);
		}
		//Draws the row and column of each tile
		if(drawTileRowCol){
			ctx.fillText(squareTiles[i].row + ',' + squareTiles[i].column, squareTiles[i].xpos-5, squareTiles[i].ypos-5);
		}
	}

	//For path debugging, draws the path if the unit is not moving on it yet
	if(movingOnPath === false){
		for(var i in pathToDraw){
			ctx.drawImage(unit1,pathToDraw[i].xLeft,pathToDraw[i].yTop);
			ctx.fillText(i, pathToDraw[i].xpos-5, pathToDraw[i].ypos-5);
		}
	}

	//Draws the wood objects
	for(var i in woodArray){
		if(!woodArray[i].objIsHeld){
			ctx.drawImage(woodImg,woodArray[i].xLeft,woodArray[i].yTop);
		}
	}

	//Draws the structures
	for(var i in structArray){
		ctx.drawImage(structImg,structArray[i].currentTile.xLeft,structArray[i].currentTile.yTop);
	}

	//ResourceDropOff sprites
	if(CivMind.woodGathered > 0){
		ctx.drawImage(woodImg,CivMind.resourceDropOff.xLeft,CivMind.resourceDropOff.yTop);
	}

	//Draws the units
	for(var i in unitArray){
		unitArray[i].animate();
		ctx.drawImage(unitArray[i].currentSprite,unitArray[i].xLeft,unitArray[i].yTop);
	}

	//Hover listener, does stuff based on where the mouse is on the canvas
	if(hoverListener){
	//--Offset only needed if canvas does not start at 0,0 (or grid does not start at 0,0)
		//Sets x and y variables for where the mouse is, with offset
		if(mouseInCanvas){
			xPosi = (mouse.x - canvasOffset.left);
			yPosi = (mouse.y - canvasOffset.top);
		}
		displayHoverTile(xPosi,yPosi);	//draws an image on the tile that is being hovered over
	}

	ctx.fillText(CivMind.woodGathered,CivMind.resourceDropOff.xpos,CivMind.resourceDropOff.ypos);	//draws number of wood in the resource drop off
}

function gameUpdateSecond(){
//--CivMind updates
	//Push wood objects into the CivMind's array, to keep track of what positions the CivMind is aware of (this will be more important once a range limit is implemented, so that it doesnt track every single wood object in the game world)
	for(var i in woodArray){
		if(woodArray[i].objIsHeld === false && CivMind.woodPosArray.indexOf(woodArray[i].currentTile) < 0 && woodArray[i].currentTile != CivMind.resourceDropOff){
			CivMind.woodPosArray.push(woodArray[i].currentTile);
		}
	}
	CivMind.woodGathered = CivMind.resourceDropOff.objOcc.length;	//Number of wood in the resource tile



	//Sets the next building spot once a building has been constructed on the current spot
	if(curBuildingSpot.hasStructure && buildingSpotArray.length > 0){
		curBuildingSpot = buildingSpotArray[0];
		buildingSpotArray.shift();
	}


	//CivMind controls for units; makes the program try to give actions to units that currently dont have actions (wandering) before those that are acting
	var tempArray = [];
	for(var i in CivMind.workerArray){
		if(CivMind.workerArray[i].currentAction === 'wander'){
			CivMind.unitUpdateOrder.push(CivMind.workerArray[i]);
		}
		else{
			tempArray.push(CivMind.workerArray[i]);
		}
	}
	CivMind.unitUpdateOrder = CivMind.unitUpdateOrder.concat(tempArray);

	//Unit array updates for actions
	for(var i in CivMind.unitUpdateOrder){
		if(unitArray[i].ai){
			//build if there is at least 6 wood gathered and no unit is building
			if(CivMind.woodGathered >= 6 && (unitArray[i].currentAction === 'build' || CivMind.workerBuilders === 0)){
				unitArray[i].updateAction('build');
			}
			//gather if holding less than 5 resources and there are resources to collect
			else if(unitArray[i].objHeld.length < unitArray[i].objHeldMax && CivMind.woodPosArray.length > 0){
				unitArray[i].updateAction('gather wood');
			}
			//deposit if holding 5 resources or if holding more than one resource and there are no more resources to collect
			else if(unitArray[i].objHeld.length >= unitArray[i].objHeldMax || (unitArray[i].objHeld.length > 0 && CivMind.woodPosArray.length === 0)){
				unitArray[i].updateAction('deposit wood');
			}
			else{
				//wander
				unitArray[i].updateAction('wander');
			}
		}
	}

	//Update the CivMind, which is supposed to track things but i may just change unit actions to update the CivMind as they happen
	CivMind.update();
}

//Sets building spots to four specific places, currently called at game start
function setBuildingSpots(){
	curBuildingSpot = squareTiles[103];
	buildingSpotArray = [squareTiles[90],squareTiles[25],squareTiles[53]];
}





//Creates the initial grid for the game
function createSquareGrid(){
	for(var i = 0; i<gridNumberSquares[0]; i++){
		for(var j=0; j<gridNumberSquares[1]; j++){
				squareTiles[squareTiles.length] = new squareTile(j,i,squareTiles.length);
		}
	}
	for(var i=0; i<squareTiles.length; i++){
		ctx.drawImage(squarePNG,squareTiles[i].xLeft,squareTiles[i].yTop);
	}
}

//For setting the terrain of each tile (for drawing and terrain-specific variables like impassable)
function gridTerrainVariableSet(){
	//Mountains
	gridSetMountains();
}

//Sets the mountain tiles and makes them impassable
function gridSetMountains(){
	for(var i=0; i<squareTiles.length; i++){
		if(squareTiles[i].column === maxColumnNumber || squareTiles[i].column === 0 || squareTiles[i].row === maxRowNumber || squareTiles[i].row === 0){
			squareTiles[i].terrainVariable = 'Mountain';
		}
	}

	for(var i in squareTiles){
		if(squareTiles[i].terrainVariable === 'Mountain'){
			squareTiles[i].impassable = true;
		}
	}
}








//Detects which key is pressed and does something if its one of the given keys
function keyPressedHandler(e) {
	var code = (e.keyCode ? e.keyCode : e.which);
	var clickedTile = findTileXY(xPosi,yPosi);
	switch(code) {
		case ONE_KEY:
			var u = createUnit(findTileXY(xPosi,yPosi));
			CivMind.addWorkerToArray(u);
			break;
		case TWO_KEY:
			aiSet();
			break;
		case THREE_KEY:
			spawnRandomWood();
			break;
		case FOUR_KEY:
			setBuildingSpotsRan();
			break;
		case FIVE_KEY:
			spawnWood(clickedTile);
			break;
		case SIX_KEY:
			for(var i=0;i<12;i++){
				spawnWood(clickedTile);
			}
			break;
		case SEVEN_KEY:
			clickedTile.setVar('Mountain');
			break;
		case EIGHT_KEY:
			clickedTile.setVar('Grass');
			break;
		case NUMPAD1:
			if(!clickedTile.impassable){
				drawPath(unitArray[0].currentTile,clickedTile);
			}
			break;
		case NUMPAD2:
			if(pathToDraw.length > 0){
				moveOnPath(unitArray[0],pathToDraw);
			}
			else{
				var path;
				if(!clickedTile.impassable){
					path = pathFind(unitArray[0].currentTile,clickedTile,unitArray[0]);
				}
				moveOnPath(unitArray[0],path);
			}
			break;
		case P_KEY:
			pauseGame();
			break;
	}
}

//Sets x/y values for a unit based on the given tile's values
function setCurrentTile(unitIn,tileIn){
	unitIn.currentTile = tileIn;
	unitIn.xLeft = tileIn.xLeft;
	unitIn.yTop = tileIn.yTop;
	unitIn.xpos = tileIn.xpos;
	unitIn.ypos = tileIn.ypos;
}

//Creates a new unit on the tile inputted
function createUnit(tileIn){
	var newUnit = new Unit(tileIn);
	unitArray.push(newUnit);
	newUnit.name = 'Worker ' + unitArray.indexOf(newUnit);
	return newUnit;
}

//Spawns a wood on the given tile
function spawnWood(tileIn){
	if(!tileIn.impassable){
		var wood = new Wood(tileIn);
		wood.currentTile.objOcc.push(wood);
		woodArray.push(wood);
	}
}

//Adds the given object to the unit's 'inventory', and removes the object from the CivMind's position array
function pickUpObject(unitIn,objIn){
	unitIn.objHeld.push(objIn);
	objIn.currentTile.objOcc.splice(objIn.currentTile.objOcc.indexOf(objIn),1);
	objIn.objIsHeld = true;
	CivMind.woodPosArray.splice(CivMind.woodPosArray.indexOf(unitIn.currentTile),1);
}

//Drops the given object onto the unit's current tile
function dropObject(unitIn,objInArray){
	for(var i in objInArray){
		unitIn.currentTile.objOcc.push(objInArray[i]);
		setCurrentTile(objInArray[i],unitIn.currentTile);
		objInArray[i].objIsHeld = false;
		if(unitIn.currentTile === CivMind.resourceDropOff){
			CivMind.woodGatArray.push(objInArray[i]);
			woodArray.splice(woodArray.indexOf(objInArray[i]),1);
		}
	}
	unitIn.objHeld.splice(0,objInArray.length);
}

//Pauses the update functions
function pauseGame(){
	if(!pause){
		pause = true;
		printSideConsole('Game is PAUSED');
		for(var i in unitArray){
			clearInterval(unitArray[i].pathInterval);
		}
	}
	else{
		pause = false;
		printSideConsole('Game is UNPAUSED');
	}
}