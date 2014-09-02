/////////////////////
//	Random AI  JS  //
/////////////////////

//Variable Initialization
var drawTileNumbers,drawTileRowCol,tempTime,pathToDraw,ONE_KEY,TWO_KEY,THREE_KEY,FOUR_KEY,FIVE_KEY,SIX_KEY,xPosi,yPosi,movingOnPath,curBuildingSpot,buildingSpotArray;
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
movingOnPath = false;
xPosi = 0;
yPosi = 0;


function gameUpdate(){
	ctx.font = "12px Arial";
	ctx.fillStyle = 'black';
	for(var i = 0; i<squareTiles.length; i++){
		if(squareTiles[i].terrainVariable === 'Grass'){
			ctx.drawImage(squareGrass, squareTiles[i].xLeft, squareTiles[i].yTop);
		}
		else if(squareTiles[i].terrainVariable === 'Lake'){
			ctx.drawImage(squareLake, squareTiles[i].xLeft, squareTiles[i].yTop);
		}
		else if(squareTiles[i].terrainVariable === 'Castle'){
			ctx.drawImage(squareCastle, squareTiles[i].xLeft, squareTiles[i].yTop);
		}
		else if(squareTiles[i].terrainVariable === 'River'){
			ctx.drawImage(squareRiver, squareTiles[i].xLeft, squareTiles[i].yTop);
		}
		else if(squareTiles[i].terrainVariable === 'Mountain'){
			ctx.drawImage(squareMountain, squareTiles[i].xLeft, squareTiles[i].yTop);
		}
		else if(squareTiles[i].terrainVariable === 'Hut'){
			ctx.drawImage(squareHut, squareTiles[i].xLeft, squareTiles[i].yTop);
		}

		if(drawTileNumbers){
			ctx.fillText(i, squareTiles[i].xpos-5, squareTiles[i].ypos-5);
		}
		if(drawTileRowCol){
			ctx.fillText(squareTiles[i].row + ',' + squareTiles[i].column, squareTiles[i].xpos-5, squareTiles[i].ypos-5);
		}
	}

	if(movingOnPath === false){
		for(var i in pathToDraw){
			ctx.drawImage(unit1,pathToDraw[i].xLeft,pathToDraw[i].yTop);
			ctx.fillText(i, pathToDraw[i].xpos-5, pathToDraw[i].ypos-5);
		}
	}

	for(var i in woodArray){
		if(!woodArray[i].objIsHeld){
			ctx.drawImage(woodImg,woodArray[i].xLeft,woodArray[i].yTop);
		}
	}

	for(var i in structArray){
		ctx.drawImage(structImg,structArray[i].currentTile.xLeft,structArray[i].currentTile.yTop);
	}

	//ResourceDropOff sprites
	if(CivMind.woodGathered > 0){
		ctx.drawImage(woodImg,CivMind.resourceDropOff.xLeft,CivMind.resourceDropOff.yTop);
	}

	for(var i in unitArray){
		unitArray[i].animate();
		ctx.drawImage(unitArray[i].currentSprite,unitArray[i].xLeft,unitArray[i].yTop);
	}

	if(hoverListener){
		tempTime = (tempTime+1) % 30;
		if(tempTime === 0){
			// console.log(mouse.x + ',' + mouse.y);
		}
	//--Offset only needed if canvas does not start at 0,0 (or grid does not start at 0,0)
		if(mouseInCanvas){
			xPosi = (mouse.x - canvasOffset.left);
			yPosi = (mouse.y - canvasOffset.top);
		}
		displayHoverTile(xPosi,yPosi);
	}

	ctx.fillText(CivMind.woodGathered,CivMind.resourceDropOff.xpos,CivMind.resourceDropOff.ypos);
}

function gameUpdateSecond(){
	for(var i in woodArray){
		if(woodArray[i].objIsHeld === false && CivMind.woodPosArray.indexOf(woodArray[i].currentTile) < 0 && woodArray[i].currentTile != CivMind.resourceDropOff){
			CivMind.woodPosArray.push(woodArray[i].currentTile);
		}
	}

	CivMind.woodGathered = CivMind.resourceDropOff.objOcc.length;

	if(curBuildingSpot.hasStructure && buildingSpotArray.length > 0){
		curBuildingSpot = buildingSpotArray[0];
		buildingSpotArray.shift();
	}

	for(var i in unitArray){
		if(unitArray[i].ai){
			if(CivMind.woodGathered >= 6 && (unitArray[i].currentAction === 'build' || CivMind.workerBuilders === 0)){
				unitArray[i].updateAction('build');
				// if(unitArray[i].currentTile != curBuildingSpot){
				// 	var path = pathFind(unitArray[i].currentTile,curBuildingSpot,unitArray[i]);
				// 	moveOnPath(unitArray[i],path);
				// }
				// else{
				// 	CivMind.buildStructure(curBuildingSpot);
				// }
			}
			else if(unitArray[i].objHeld.length < 5 && CivMind.woodPosArray.length > 0){
				unitArray[i].updateAction('gather wood');
				var closestWood = CivMind.getClosestWood(unitArray[i]);
				if(unitArray[i].currentTile != closestWood){
					var path = pathFind(unitArray[i].currentTile,closestWood,unitArray[i]);
					moveOnPath(unitArray[i],path);
				}
				else{
					pickUpObject(unitArray[i],unitArray[i].currentTile.objOcc[0]);
				}
			}
			else if(unitArray[i].objHeld.length >= 5){
				unitArray[i].updateAction('gather wood');
				if(unitArray[i].currentTile != CivMind.resourceDropOff){
					var path = pathFind(unitArray[i].currentTile,CivMind.resourceDropOff,unitArray[i]);
					moveOnPath(unitArray[i],path);
				}
				else{
					dropObject(unitArray[i],unitArray[i].objHeld);	
				}
			}
			else if(unitArray[i].objHeld.length > 0 && CivMind.woodPosArray.length === 0){
				unitArray[i].updateAction('deposit wood');
				if(unitArray[i].currentTile != CivMind.resourceDropOff){
					var path = pathFind(unitArray[i].currentTile,CivMind.resourceDropOff,unitArray[i]);
					moveOnPath(unitArray[i],path);
				}
				else{
					dropObject(unitArray[i],unitArray[i].objHeld);	
				}
			}
			else{
				//wander
				unitArray[i].updateAction('wander');
			}
		}
	}

	CivMind.update();
}

function setBuildingSpots(){
	curBuildingSpot = squareTiles[103];
	buildingSpotArray = [squareTiles[90],squareTiles[25],squareTiles[53]];
}

function setBuildingSpotsRan(){
	buildingSpotArray = [];
	var ranSpot;
	for(var i=0; i<10; i++){
		var whileSize = 0;
		ranSpot = squareTiles[Math.floor(Math.random()*squareTiles.length)];
		while(ranSpot.impassable && whileSize < 101 && buildingSpotArray.indexOf(ranSpot) < 0){
			ranSpot = squareTiles[Math.floor(Math.random()*squareTiles.length)];
			whileSize += 1;
		}
		// console.log(whileSize);
		buildingSpotArray.push(ranSpot);
	}
	curBuildingSpot = buildingSpotArray[0];
}






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

function gridTerrainVariableSet(){
	//Order of terrain setting
	//----River
	//----Lake
	//----Castle
	//----Mountain


	//River
	// gridSetRiver();

	//Lake
	// gridSetLake();

	//Castle
	// gridSetCastle();

	//Mountains
	gridSetMountains();

	//Hut
	// gridSetHut();
	

}

function gridSetLake(){
	lakeStartTile.terrainVariable = 'Lake';
	var lColumn = lakeStartTile.column;
	var lRow = lakeStartTile.row;
	for(var i=0; i<squareTiles.length; i++){
		var sTileC = squareTiles[i].column;
		var sTileR = squareTiles[i].row;
		if(sTileC >= lColumn-2 && sTileC <= lColumn+2 && sTileR >= lRow-2 && sTileR <= lRow+2){ //Within 2 columns and 2 rows of the lake start tile
			if(!(sTileC === lColumn-2 && (sTileR === lRow-2 || sTileR === lRow+2)) && !(sTileC === lColumn+2 && (sTileR === lRow-2 || sTileR === lRow+2))){ //Excluding the corner tiles
				squareTiles[i].terrainVariable = 'Lake';
			}
		}
		//if((sTileC === lColumn && (sTileR === lRow-3 || sTileR === lRow+3)) || (sTileR === lRow && (sTileC === lColumn-3 || sTileC === lColumn+3))){	//Tiles 3 up, 3 down, 3 left, and 3 right from the lake start tile
		//	squareTiles[i].terrainVariable = 'Lake';
		//}
	}
}

function gridSetRiver(){
	riverStartTile.terrainVariable = 'River';
	var lastRiverTile = riverStartTile;
	var nextRiverTile = riverStartTile;
	var randomNumber;
	//riverStartNumber = 2;
	//Depending on the starting number, go through columns or rows. Random number between 0 and 2, which correlate to one of 3 tiles in front of the lastRiverTile. At the end, also change the adjacent tile of each River tile into a River tile (1 up or 1 right).
	if(riverStartNumber === 1){
		for(var h=2; h<=maxRowNumber; h++){
			lastRiverTile = nextRiverTile;
			if(lastRiverTile.column <= 1){
				randomNumber = Math.random()*2 + 1;
			}			
			else if(lastRiverTile.column >= maxColumnNumber-1){
				randomNumber = Math.random()*2;
			}
			else{
				randomNumber = Math.random()*3;
			}
			if(h===2 || h===3){
				randomNumber = 1;
			}

			if(randomNumber < 1){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].row === h && squareTiles[i].column === lastRiverTile.column-1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else if(randomNumber < 2){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].row === h && squareTiles[i].column === lastRiverTile.column){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else{
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].row === h && squareTiles[i].column === lastRiverTile.column+1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
		}
	}
	else if(riverStartNumber === 2){
		for(var h=maxColumnNumber-2; h>=0; h--){
			lastRiverTile = nextRiverTile;
			if(lastRiverTile.row <= 1){
				randomNumber = Math.random()*2 + 1;
			}			
			else if(lastRiverTile.row >= maxRowNumber-1){
				randomNumber = Math.random()*2;
			}
			else{
				randomNumber = Math.random()*3;
			}
			if(h===maxColumnNumber-3 || h===maxColumnNumber-4){
				randomNumber = 1;
			}
			
			if(randomNumber < 1){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].column === h && squareTiles[i].row === lastRiverTile.row-1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else if(randomNumber < 2){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].column === h && squareTiles[i].row === lastRiverTile.row){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else{
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].column === h && squareTiles[i].row === lastRiverTile.row+1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
		}
	}
	else if(riverStartNumber === 3){
		for(var h=maxRowNumber-2; h>=0; h--){
			lastRiverTile = nextRiverTile;
			if(lastRiverTile.column <= 1){
				randomNumber = Math.random()*2 + 1;
			}			
			else if(lastRiverTile.column >= maxColumnNumber-1){
				randomNumber = Math.random()*2;
			}
			else{
				randomNumber = Math.random()*3;
			}
			if(h===maxRowNumber-3 || h===maxRowNumber-4){
				randomNumber = 1;
			}
			
			if(randomNumber < 1){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].row === h && squareTiles[i].column === lastRiverTile.column-1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else if(randomNumber < 2){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].row === h && squareTiles[i].column === lastRiverTile.column){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else{
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].row === h && squareTiles[i].column === lastRiverTile.column+1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
		}
	}
	else if(riverStartNumber === 4){
		for(var h=2; h<=maxColumnNumber; h++){
			lastRiverTile = nextRiverTile;
			if(lastRiverTile.row <= 1){
				randomNumber = Math.random()*2 + 1;
			}			
			else if(lastRiverTile.row >= maxRowNumber-1){
				randomNumber = Math.random()*2;
			}
			else{
				randomNumber = Math.random()*3;
			}
			if(h===2 || h===3){
				randomNumber = 1;
			}
			
			if(randomNumber < 1){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].column === h && squareTiles[i].row === lastRiverTile.row-1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else if(randomNumber < 2){
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].column === h && squareTiles[i].row === lastRiverTile.row){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
			else{
				for(var i=0; i<squareTiles.length; i++){
					if(squareTiles[i].column === h && squareTiles[i].row === lastRiverTile.row+1){
						squareTiles[i].terrainVariable = 'River';
						nextRiverTile = squareTiles[i];
					}
				}
			}
		}
	}


	/*for(var i=0; i<squareTiles.length; i++){
		if(squareTiles[i].row === riverStartTile.row){
			squareTiles[i].terrainVariable = 'River';
		}
	}*/
	var riverStartArea = [];
	var riverEndArea = [];
	for(var i=0; i<squareTiles.length; i++){
		if(squareTiles[i].terrainVariable === 'River'){
			for(var j=0; j<squareTiles.length; j++){
				if(riverStartNumber === 2 || riverStartNumber === 4){
					if((squareTiles[j].row === squareTiles[i].row-1 || squareTiles[j].row === squareTiles[i].row+1) && squareTiles[j].column === squareTiles[i].column){
						riverArray[riverArray.length] = squareTiles[j];
						if(squareTiles[j].column === riverStartTile.column){
							riverStartArea[riverStartArea.length] = squareTiles[j];
						}
						else if (squareTiles[j].column === maxColumnNumber || squareTiles[j].column === 0){
							riverEndArea[riverEndArea.length] = squareTiles[j];
						}
					}
				}
				else if(riverStartNumber === 1 || riverStartNumber === 3){
					if((squareTiles[j].column === squareTiles[i].column+1 || squareTiles[j].column === squareTiles[i].column-1) && squareTiles[j].row === squareTiles[i].row){
						riverArray[riverArray.length] = squareTiles[j];
						if(squareTiles[j].row === riverStartTile.row){
							riverStartArea[riverStartArea.length] = squareTiles[j];
						}
						else if (squareTiles[j].row === maxRowNumber || squareTiles[j].row === 0){
							riverEndArea[riverEndArea.length] = squareTiles[j];
						}
					}
				}
			}
		}
	}
	for(var i=0; i<riverArray.length; i++){
		riverArray[i].terrainVariable = 'River';
	}
}


function gridSetCastle(){
	//castleStartTile = findTile(7,7);
	castleStartTile.terrainVariable = 'Castle';
	var cColumn = castleStartTile.column;
	var cRow = castleStartTile.row;

	//Setting tiles to castle
	findTile(cRow,cColumn-1).terrainVariable = 'Castle';
	findTile(cRow,cColumn-2).terrainVariable = 'Castle';
	findTile(cRow,cColumn+1).terrainVariable = 'Castle';
	findTile(cRow-1,cColumn).terrainVariable = 'Castle';
	findTile(cRow-1,cColumn-1).terrainVariable = 'Castle';
	findTile(cRow-1,cColumn-2).terrainVariable = 'Castle';
	findTile(cRow-1,cColumn+1).terrainVariable = 'Castle';
	findTile(cRow-2,cColumn).terrainVariable = 'Castle';
	findTile(cRow-2,cColumn-1).terrainVariable = 'Castle';
	findTile(cRow-2,cColumn-2).terrainVariable = 'Castle';
	findTile(cRow-2,cColumn+1).terrainVariable = 'Castle';
	findTile(cRow-3,cColumn).terrainVariable = 'Castle';
	findTile(cRow-3,cColumn-1).terrainVariable = 'Castle';
}




function gridSetHut(){
	hutStartTile = squareTiles[Math.floor(Math.random()*squareTiles.length)];
	var hutStartTriedArray = [];
	while(hutStartTile.row < 4 || hutStartTile.column < 4 || hutStartTile.row > maxRowNumber-4 || hutStartTile.column > maxColumnNumber-4 || hutStartTile.terrainVariable != 'Grass' || hutStartTile.hutStartTried === true){
		hutStartTile.hutStartTried = true;
		hutStartTile = squareTiles[Math.floor(Math.random()*squareTiles.length)]
	}
	var hutSquareFound = true;
	var hutStartTileArray = [];
	var retryAttempts = 1;
	for(var i=(-2); i<3;i++){
		for(var j=(-2); j<3; j++){
			hutStartTileArray[hutStartTileArray.length] = findTile(((hutStartTile.row)+i),((hutStartTile.column)+j));
		}
	}
	for(var i=0; i<hutStartTileArray.length; i++){
		if(hutStartTileArray[i].terrainVariable != 'Grass'){
			hutSquareFound = false;
		}
	}
	if(hutSquareFound === true){
		console.log('HutSquareFound! All grass. Attempts: ' + retryAttempts);
	}
	else{
		console.log('HutSquareFound is false. Reattempting. RetryAttempt: ' + (retryAttempts+1));
	}
	while(hutSquareFound != true && retryAttempts < squareTiles.length){
		retryAttempts += 1;
		hutStartTile = squareTiles[Math.floor(Math.random()*squareTiles.length)];
		while(hutStartTile.row < 4 || hutStartTile.column < 4 || hutStartTile.row > maxRowNumber-4 || hutStartTile.column > maxColumnNumber-4 || hutStartTile.terrainVariable != 'Grass' || hutStartTile.hutStartTried === true){
			hutStartTile.hutStartTried = true;
			hutStartTile = squareTiles[Math.floor(Math.random()*squareTiles.length)]
		}
		hutSquareFound = true;
		hutStartTileArray = [];
		for(var i=(-2); i<3;i++){
			for(var j=(-2); j<3; j++){
				hutStartTileArray[hutStartTileArray.length] = findTile(((hutStartTile.row)+i),((hutStartTile.column)+j));
			}
		}
		for(var i=0; i<hutStartTileArray.length; i++){
			if(hutStartTileArray[i].terrainVariable != 'Grass'){
				hutSquareFound = false;
			}
		}
		if(hutSquareFound === true){
			console.log('HutSquareFound! All grass. Attempts: ' + retryAttempts);
		}
		else{
			console.log('HutSquareFound is false. Reattempting. RetryAttempt: ' + (retryAttempts+1));
		}
	}
	console.log('HutStartTile: ' + hutStartTile);
	hutStartTile.terrainVariable = 'Hut';
	findTile(hutStartTile.row,hutStartTile.column-1).terrainVariable = 'Hut';
	findTile(hutStartTile.row-1,hutStartTile.column).terrainVariable= 'Hut';
	findTile(hutStartTile.row-1,hutStartTile.column-1).terrainVariable = 'Hut';
}





function gridSetMountains(){
	for(var i=0; i<squareTiles.length; i++){
		if(squareTiles[i].column === maxColumnNumber || squareTiles[i].column === 0 || squareTiles[i].row === maxRowNumber || squareTiles[i].row === 0){
			// if(!(squareTiles[i].terrainVariable === 'River' && squareTiles[i].column === 0 && riverStartNumber === 2) && !(squareTiles[i].terrainVariable === 'River' && squareTiles[i].column === maxColumnNumber && riverStartNumber === 4) && !(squareTiles[i].terrainVariable === 'River' && squareTiles[i].row === maxRowNumber && riverStartNumber === 1) && !(squareTiles[i].terrainVariable === 'River' && squareTiles[i].row === 0 && riverStartNumber === 3)){	//This makes sure that the River ends in river tiles, instead of in mountains
				squareTiles[i].terrainVariable = 'Mountain';
			// }
		}
	}
	// if(riverStartNumber === 2){	//Sets the tiles around the river start tile to mountains, reflecting the water coming from the mountains
	// 	setTileVariable(riverStartTile.row-1,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row-2,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row+1,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row+2,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row+1,riverStartTile.column-1,'Mountain');
	// 	setTileVariable(riverStartTile.row-1,riverStartTile.column-1,'Mountain');
	// 	setTileVariable(riverStartTile.row-1,riverStartTile.column-1,'Mountain');
	// }
	// else if(riverStartNumber === 4){
	// 	setTileVariable(riverStartTile.row-1,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row-2,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row+1,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row+2,riverStartTile.column,'Mountain');
	// 	setTileVariable(riverStartTile.row+1,riverStartTile.column+1,'Mountain');
	// 	setTileVariable(riverStartTile.row-1,riverStartTile.column+1,'Mountain');
	// }
	// else if(riverStartNumber === 1){
	// 	setTileVariable(riverStartTile.row,riverStartTile.column-1,'Mountain');
	// 	setTileVariable(riverStartTile.row,riverStartTile.column-2,'Mountain');
	// 	setTileVariable(riverStartTile.row,riverStartTile.column+1,'Mountain');
	// 	setTileVariable(riverStartTile.row,riverStartTile.column+2,'Mountain');
	// 	setTileVariable(riverStartTile.row+1,riverStartTile.column+1,'Mountain');
	// 	setTileVariable(riverStartTile.row+1,riverStartTile.column-1,'Mountain');
	// }
	// else if(riverStartNumber === 3){
	// 	setTileVariable(riverStartTile.row,riverStartTile.column-1,'Mountain');
	// 	setTileVariable(riverStartTile.row,riverStartTile.column-2,'Mountain');
	// 	setTileVariable(riverStartTile.row,riverStartTile.column+1,'Mountain');
	// 	setTileVariable(riverStartTile.row,riverStartTile.column+2,'Mountain');
	// 	setTileVariable(riverStartTile.row-1,riverStartTile.column+1,'Mountain');
	// 	setTileVariable(riverStartTile.row-1,riverStartTile.column-1,'Mountain');
	// }

	for(var i in squareTiles){
		if(squareTiles[i].terrainVariable === 'Mountain'){
			squareTiles[i].impassable = true;
		}
	}
}

function createUnit(tileIn){
	var newUnit = new Unit(tileIn);
	unitArray.push(newUnit);
	newUnit.name = 'Worker ' + unitArray.indexOf(newUnit);
}

function displayHoverTile(x,y){
	var hoverTile = findTileXY(x,y,'hovertile');
	ctx.drawImage(hoverTileImg,hoverTile.xLeft,hoverTile.yTop);
}

function drawPath(startTile,endTile){
	pathToDraw = pathFind(startTile,endTile);
}










function findTile(rowIn,columnIn,reason){
	var tileFound = false;
	for(var i in squareTiles){
		if(squareTiles[i].row === rowIn && squareTiles[i].column === columnIn){
			return squareTiles[i];
		}
	}
	if(!tileFound){
		if(reason === 'setAdj'){
			//do nothing for now
		}
		else if(reason != undefined){
			console.log('FindTile row: ' + rowIn + ' column: ' + columnIn + ' does not exist (Reason: ' + reason + ')');
		}
		else{
			console.log('FindTile row: ' + rowIn + ' column: ' + columnIn + ' does not exist');
		}
		return false;
	}
}

function findTileXY(x,y,reason){
	var tileRow = Math.floor(y/squareSize);
	var tileCol = Math.floor(x/squareSize);
	var tileToReturn = findTile(tileRow,tileCol,'findTileXY');
	if(tileToReturn != false){
		return tileToReturn;
	}
	else{
		console.log('findTileXY(' + x + ',' + y +') not found');
		return false;
	}
}

function setTileVariable(rowIn,columnIn,terrainVariableIn){
	var tileFound = false;
	for(var i=0; i<squareTiles.length; i++){
		if(squareTiles[i].row === rowIn && squareTiles[i].column === columnIn){
			squareTiles[i].terrainVariable = terrainVariableIn;
			tileFound = true;
		}
	}
	if(!tileFound){
		console.log('setTileVariable(row:' + rowIn + ', column:' + columnIn + ', variable:' + terrainVariableIn + ') not found');
	}
}

// function drawTileNumbers(){
// 	for(var i in squareTiles){
// 		ctx.drawImage(i,squareTiles[i].xpos,squareTiles[i].ypos);
// 	}
// }

function getAdjacentTiles(tileIn){
	var cRow,cCol,adjTiles,tiles;
	cRow = tileIn.row;
	cCol = tileIn.column;
	adjTiles = [];
	tiles = [];
	tiles[0] = findTile(cRow-1,cCol);	//Up
	tiles[1] = findTile(cRow,cCol+1);	//Right
	tiles[2] = findTile(cRow+1,cCol);	//Down
	tiles[3] = findTile(cRow,cCol-1);	//Left
	for(var i in tiles){
		if(tiles[i] != false && tiles[i].impassable === false){
			adjTiles.push(tiles[i]);
		}
	}

	return adjTiles;
}

function keyPressedHandler(e) {
	var code = (e.keyCode ? e.keyCode : e.which);
	var clickedTile = findTileXY(xPosi,yPosi);
	switch(code) {
		case ONE_KEY:
			if(clickedTile.impassable === false){
				drawPath(unitArray[0].currentTile,clickedTile);
			}
			break;
		case TWO_KEY:
			clickedTile.setVar('Mountain');
			break;
		case THREE_KEY:
			clickedTile.setVar('Grass');
			break;
		case FOUR_KEY:
			if(pathToDraw.length > 0){
				moveOnPath(unitArray[0],pathToDraw);
			}
			else{
				var path;
				if(clickedTile.impassable === false){
					path = pathFind(unitArray[0].currentTile,clickedTile,unitArray[0]);
				}
				moveOnPath(unitArray[0],path);
			}
			break;
		case FIVE_KEY:
			spawnWood(clickedTile);
			break;
		case SIX_KEY:
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			spawnWood(clickedTile);
			break;
	}
}

function setCurrentTile(unitIn,tileIn){
	unitIn.currentTile = tileIn;
	unitIn.xLeft = tileIn.xLeft;
	unitIn.yTop = tileIn.yTop;
	unitIn.xpos = tileIn.xpos;
	unitIn.ypos = tileIn.ypos;
}

function spawnWood(tileIn){
	if(!tileIn.impassable){
		var wood = new Wood(tileIn);
		wood.currentTile.objOcc.push(wood);
		woodArray.push(wood);
	}
}

function pickUpObject(unitIn,objIn){
	unitIn.objHeld.push(objIn);
	objIn.currentTile.objOcc.splice(objIn.currentTile.objOcc.indexOf(objIn),1);
	objIn.objIsHeld = true;
	CivMind.woodPosArray.splice(CivMind.woodPosArray.indexOf(unitIn.currentTile),1);
}

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

// function getClosestObj(unitIn,arrayOfObjIn){
// 	var u = unitIn;
// 	var objA = arrayOfObjIn;
// 	var curClosest
// 	var curClosestTile;

// 	for(var i in objA){
// 		var dist = getDistance(u.currentTile,objA[i].currentTile);
// 		if(dist < curClosest || typeof curClosest === 'undefined'){
// 			curClosest = dist;
// 			curClosestTile = objA[i].currentTile;
// 		}
// 	}

// 	console.log('Gettingclosestobj: ' + curClosestTile.row + ',' + curClosestTile.column);
// 	return curClosestTile;
// }

function getClosestTile(unitIn,arrayOfTileIn){
	var u = unitIn;
	var tileArray = arrayOfTileIn;
	var curClosest
	var curClosestTile;

	for(var i in tileArray){
		var dist = getDistance(u.currentTile,tileArray[i]);
		if(dist < curClosest || typeof curClosest === 'undefined'){
			curClosest = dist;
			// console.log('GetClosestTile ' + i + ': ' + dist);
			curClosestTile = tileArray[i];
		}
	}

	// console.log('Gettingclosesttile: ' + curClosestTile.row + ',' + curClosestTile.column);
	return curClosestTile;
}

function getDistance(startTile,endTile){
	xDiff = Math.abs(startTile.column - endTile.column);
	yDiff = Math.abs(startTile.row - endTile.row);
	return (xDiff+yDiff);
}

function aiSet(){
	for(var i in unitArray){
		unitArray[i].ai = true;
	}
}

function setWorkerSpeed(speedIn){
	CivMind.setWorkerSpeed(speedIn);
}

function spawnRandomWood(){
	var ranSpot;
	for(var i=0; i<10; i++){
		var whileSize = 0;
		ranSpot = squareTiles[Math.floor(Math.random()*squareTiles.length)];
		while(ranSpot.impassable && whileSize < 101){
			ranSpot = squareTiles[Math.floor(Math.random()*squareTiles.length)];
			whileSize += 1;
		}
		// console.log(whileSize);
		spawnWood(ranSpot);
	}
}