/////////////////////
//	Random AI  JS  //
/////////////////////
// Useful Scripting Functions



//Prints the given string into the side console along with the current time
function printSideConsole(txtIn){
	var d = new Date();
	var newDiv = "<div class='logMsg'>(" + (d.getHours() % 12) + ':' + d.getMinutes() + ':' + d.getSeconds() + ') ' + txtIn + "</div>";
	// console.log(newDiv);
	$('#SideConsole').append(newDiv);
	$('#SideConsole').scrollTop(100000);
}

//Starts the AI
function aiSet(){
	for(var i in unitArray){
		unitArray[i].ai = true;
	}
}

//Sets worker speed (for scripting)
function setWorkerSpeed(speedIn){
	CivMind.setWorkerSpeed(speedIn);
}

//Gets the row/column distance between two tiles.
function getDistance(startTile,endTile){
	xDiff = Math.abs(startTile.column - endTile.column);
	yDiff = Math.abs(startTile.row - endTile.row);
	return (xDiff+yDiff);
}

//Finds the tile within the given array that is closest to the given unit
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

//Spawns 10 woods on random tiles
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

//For scripting, finds a tile given the row and column. Add a reason for error checking.
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

//For scripting, find a tile given the XY coordinates
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

//Sets the variable of the tile
function setTileVariable(rowIn,columnIn,terrainVariableIn){
	var tempTile = findTile(rowIn,columnIn,'SetTileVariable');
	if(tempTile != false){
		tempTile.terrainVariable = terrainVariableIn;
	}
	else{
		console.log('setTileVariable(row:' + rowIn + ', column:' + columnIn + ', variable:' + terrainVariableIn + ') not found');
	}
}


//Draws an image on the tile currently hovered over
function displayHoverTile(x,y){
	var hoverTile = findTileXY(x,y,'hovertile');
	ctx.drawImage(hoverTileImg,hoverTile.xLeft,hoverTile.yTop);
}

//Draws the path the unit would take (for pathfinding)
function drawPath(startTile,endTile){
	pathToDraw = pathFind(startTile,endTile);
}

//Sets building spots to ten random places that arent impassable and dont have a structure
function setBuildingSpotsRan(){
	buildingSpotArray = [];
	var ranSpot;
	for(var i=0; i<10; i++){
		var whileSize = 0;
		ranSpot = squareTiles[Math.floor(Math.random()*squareTiles.length)];
		while(ranSpot.impassable && whileSize < 101 && buildingSpotArray.indexOf(ranSpot) < 0 && ranSpot.hasStructure === false){
			ranSpot = squareTiles[Math.floor(Math.random()*squareTiles.length)];
			whileSize += 1;
		}
		// console.log(whileSize);
		buildingSpotArray.push(ranSpot);
	}
	curBuildingSpot = buildingSpotArray[0];
}