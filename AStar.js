/////////////////////////////////
//	Random AI  A* Pathfinding  //
/////////////////////////////////



function pathFind(startTileIn,endTileIn,unitIn){

	//dont do anything if the path is the same as the unit's current path
	if(typeof unitIn != 'undefined' && typeof unitIn.path != 'undefined' && unitIn.path[unitIn.path.length-1] === endTileIn){
		// console.log('Path end same as last path end, not finding new path for ' + unitIn.name);
		return unitIn.path;
	}
	else{
		// console.log('pathfind started');
		var startTile,endTile,path,pathArrayOpen,pathArrayClosed,adjTiles,curTile,xDiff,yDiff,curLowestF,curNextTile;
		startTile = startTileIn;
		endTile = endTileIn;
		curTile = startTile;
		path = [];
		pathArrayOpen = [];
		pathArrayClosed = [];
		adjTiles = [];
		curLowestF = 0;
		var arraySize = 0;

		pathArrayClosed.push(curTile);

		// console.log('entering pathfind while');
		while(curTile != endTile && arraySize < 100){
			// console.log('arraySize in while: ' + arraySize);
			adjTiles = curTile.adjTiles;
			for(var i in adjTiles){
				if(pathArrayClosed.indexOf(adjTiles[i]) < 0 && pathArrayOpen.indexOf(adjTiles[i]) < 0 && adjTiles[i].impassable === false){
					adjTiles[i].parentTile = curTile;
					pathArrayOpen.push(adjTiles[i]);
				}
			}
			
			for(var i in pathArrayOpen){
				xDiff = Math.abs(pathArrayOpen[i].row - startTile.row)*10;
				yDiff = Math.abs(pathArrayOpen[i].column - startTile.column)*10;
				pathArrayOpen[i].astarG = xDiff+yDiff;
				xDiff = Math.abs(pathArrayOpen[i].row - endTile.row)*10;
				yDiff = Math.abs(pathArrayOpen[i].column - endTile.column)*10;
				pathArrayOpen[i].astarH = xDiff+yDiff;
				pathArrayOpen[i].astarF = pathArrayOpen[i].astarG + pathArrayOpen[i].astarH;
			}

			for(var i in pathArrayOpen){
				if(pathArrayOpen[i].astarF < curLowestF || curLowestF === 0){
					curLowestF = pathArrayOpen[i].astarF;
					curNextTile = pathArrayOpen[i];
				}
			}

			// curNextTile.parentTile = curTile;
			// console.log('curTile ' + curTile.tileNum);
			// console.log('curNextTile ' + curNextTile.tileNum);
			// var curTileOld = curTile;
			curTile = curNextTile;
			// console.log('curTile2 ' + curTileOld.tileNum);
			// console.log('curTileNew ' + curTile.tileNum)
			pathArrayOpen.splice(pathArrayOpen.indexOf(curTile),1);
			pathArrayClosed.push(curTile);
			curLowestF = 0;
			arraySize += 1;
		 }
		// console.log('path find ended');

		while(curTile != startTile){
			path.unshift(curTile);
			curTile = curTile.parentTile;
		}
		// path.unshift(curTile);

		// console.log(pathArrayClosed);
		// console.log(pathArrayClosed.length);
		// console.log(path);
		// console.log(path.length);
		// console.log('ArraySize: ' + arraySize);
		return path;
	}

}

function moveOnPath(unit,pathIn){
	var pathInterval,path;
	movingOnPath = true;
	unit.path = pathIn;
	unit.pathEnd = pathIn[pathIn.length-1];
	CivMind.workerEndPathArray[CivMind.workerArray.indexOf(unit)] = unit.pathEnd;
	// console.log('PATH:' + unit.path);
	// console.log('PATHend: ' + unit.path[unit.path.length-1].column + ',' + unit.path[unit.path.length-1].row);
	clearInterval(unit.pathInterval);

	//Step Movement
	// unit.pathInterval = setInterval(function(){
	// 	if(unit.path.length > 0){
	// 	//Step Movement
	// 		setCurrentTile(unit,unit.path[0]);
	// 		unit.path.shift();
	// 	}
	// 	else{
	// 		movingOnPath = false;
	// 		clearInterval(unit.pathInterval);
	// 	}
	// },150);

	//Smooth Movement
	unit.pathInterval = setInterval(function(){
		if(unit.path.length > 0){
		//Smooth Movement
			if(unit.path[0].xpos != unit.xpos){
				if(unit.path[0].xpos > unit.xpos){
					unit.xpos += unit.xspeed;
					unit.xLeft += unit.xspeed;
					unit.changeDirection(1);
				}
				else if(unit.path[0].xpos < unit.xpos){
					unit.xpos -= unit.xspeed;
					unit.xLeft -= unit.xspeed;
					unit.changeDirection(0);
				}
			}
			if(unit.path[0].ypos != unit.ypos){
				if(unit.path[0].ypos > unit.ypos){
					unit.ypos += unit.yspeed;
					unit.yTop += unit.yspeed;
				}
				else{
					unit.ypos -= unit.yspeed;
					unit.yTop -= unit.yspeed;
				}
			}
			if(unit.path[0].xpos === unit.xpos && unit.path[0].ypos === unit.ypos){
				setCurrentTile(unit,unit.path[0]);
				unit.path.shift();
			}
		}
		else{
			movingOnPath = false;
			clearInterval(unit.pathInterval);
		}
	},15);
}