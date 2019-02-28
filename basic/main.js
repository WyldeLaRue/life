var elem = document.getElementById('twojs-container');
var params = { width: 600, height: 600};
var two = new Two(params).appendTo(elem);

// two has convenience methods to create shapes.
// var circle = two.makeCircle(72, 100, 50);
const cell_width = 10;
const cell_height = 10;
// var rect = two.makeRectangle(0, 0, cell_width, cell_height);
    
const num_rows = params.width/cell_width;
const num_columns = params.height/cell_height;

var grid = [];

for (var i=0; i < num_rows; i++) {
    var row = [];
    for (var j=0; j < num_columns; j++) {
        const midpoint = {x: (i + 1/2)*cell_width, y: (j + 1/2)*cell_height}
        var cell = two.makeRectangle(midpoint.x, midpoint.y, cell_width, cell_height);
        row.push(cell);
        // cell.fill = 'rgb(0, 200, 255)';
        const angle = i/num_columns * 360;
        cell.fill = 'hsl(' + angle + ', 100%, 50%)';
        // cell.opacity = (i + j)/(num_rows + num_columns);
        cell.opacity = 0.6;
        cell.noStroke();
    }
    grid.push(row)
}    
two.update();


state_grid = grid.map( 
        (col) => col.map( (state) => 0)
);


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CellSpace{
    constructor(state_grid, display_grid, two) {
        this.state = state_grid;
        this.display_grid = display_grid; 
        this.two = two;
        this.loop();
      }



    /*----------  Runners  ----------*/
    async loop() {
        this.create_glider_southeast(4,4);
        this.create_glider_northeast(20,5)
        this.create_blinker(30,30);
        for (let i=0; i < 2000; i++) {
            await sleep(200);
            this.updateAll();
            this.updateDisplay();
            this.two.update();
        }
        console.log("finished.");
    }

    async debug() {
        // alert("made it to debug")
        await sleep(2000);

        // this.updateAll();
        this.updateDisplay();
        this.two.update();
        await sleep(3000);
        this.loop();
    }

    /*----------  initial states  ----------*/
    create_glider_northeast(x,y) {
       this.state[x][y+1] = 1;
       this.state[x+1][y] = 1;
       this.state[x-1][y-1] = 1;
       this.state[x][y-1] = 1;
       this.state[x+1][y-1] = 1;
    }

    create_glider_southwest(x,y) {
       this.state[x][y+1] = 1;
       this.state[x+1][y] = 1;
       this.state[x-1][y-1] = 1;
       this.state[x-1][y] = 1;
       this.state[x-1][y+1] = 1;
    }

    create_glider_southeast(x,y) {
       this.state[x][y+1] = 1;
       this.state[x-1][y] = 1;
       this.state[x+1][y-1] = 1;
       this.state[x+1][y] = 1;
       this.state[x+1][y+1] = 1;
    }

    create_pulsar(x,y) {
        this.state[x][y] = 1
    }


    create_blinker(x,y) {
        this.state[x][y-1] = 1;
        this.state[x][y] = 1;
        this.state[x][y+1] = 1;
    }


  // -- Toroidal boundary -- //
    get_state(x, y) {  
        x = (x + this.state.length) % this.state.length
        y = (y + this.state.length) % this.state.length
        return this.state[x][y];
    }

  // -- No Boundary Conditions -- // 
    // get_state(x, y) { 
    //     const bound = this.state.length - 1
    //     if ( (0 <= x) && (x <= bound) && (0 <= y) && (y <= bound)) {
    //         return this.state[x][y];
    //     } else {
    //         return 0
    //     }
    // }

    // point --> set  
    neighborhood(x, y) {
        return [
            this.get_state(x-1, y-1),
            this.get_state(x-1, y),
            this.get_state(x-1, y+1),
            this.get_state(x, y-1),
            // this.get_state(x, y)
            this.get_state(x, y+1),
            this.get_state(x+1, y-1),
            this.get_state(x+1, y),
            this.get_state(x+1, y+1)
        ]

    }
    average(x, y) { 
        var sum = this.neighborhood(x,y).reduce(
           ( accumulator, currentValue ) => accumulator + currentValue, 0
         );
        return sum
    }

    stateFunction(x,y, state) {
        const neighbor_average = this.average(x,y)
        var newState = 0
        if (neighbor_average < 2 || neighbor_average > 3) // If fewer than 2 neighbors or more than 3 neighbors, die. 
            newState = 0
        else if (neighbor_average == 3 || (neighbor_average == 2 && state != 0) )
            newState = 1
        return newState
    }

    color(state) {
        if (state == 0)
            return 'rgb(0, 200, 255)';
        else
            return 'rgb(255, 200, 0)';
    }

    updateAll() {
        this.state = this.state.map(
            ( col, i) => col.map( (state, j) => this.stateFunction(i,j, state) )
        );
    }

    updateDisplay() {
        for (let [i, col] of this.display_grid.entries()) {
            for (let [j, maybe_cell] of col.entries()) {
                var cell = this.display_grid[i][j];  // don't know whether this gets passed by reference or not
                // could use maybe_cell instead
                cell.fill = this.color(this.state[i][j]);
            }
        }
    }
}


space = new CellSpace(state_grid, grid, two);


