import React, { Component } from "react";
import Sudoku from "./components/Sudoku/Sudoku"
import "./App.css"
import "./utils/prism"
import "./utils/prism.css"
import { solve, deepCopy, isSafe } from "./utils/utils"
import anime from "animejs"

const SLOW_DELAY = 1;
export default class App extends Component {
  state = {
    grid: [
      [3, 0, 6, 5, 0, 8, 4, 0, 0],
      [5, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 8, 7, 0, 0, 0, 0, 3, 1],
      [0, 0, 3, 0, 1, 0, 0, 8, 0],
      [9, 0, 0, 8, 6, 3, 0, 0, 5],
      [0, 5, 0, 0, 9, 0, 6, 0, 0],
      [1, 3, 0, 0, 0, 0, 2, 5, 0],
      [0, 0, 0, 0, 0, 0, 0, 7, 4],
      [0, 0, 5, 2, 0, 6, 3, 0, 0]
    ],
    solutions: [],
    oneSolution: true,
    solving: false,
    solved: false,
    InvalidSudoku: false,
    moves: null,
    wrong: null,
    noSolution: false,
    moreThan5: false
  }

  componentDidMount() {
    this.setState({ question: deepCopy(this.state.grid) });
    anime({
      targets: ".flex-center .col",
      scale: [0, 1],
      opacity: [0, 1],
      delay: anime.stagger(100, { start: 500, grid: [9, 9], from: "center" })
    })
  }

  generate = async () => {
    this.setState({ oneSolution: true });
    let grid = deepCopy(this.state.grid);
    // let res = await fetch("http://www.cs.utep.edu/cheon/ws/sudoku/new/?size=9&level=3");
    // res = await res.json();
    for (let i = 0; i < 9; ++i) {
      for (let j = 0; j < 9; ++j) {
        grid[i][j] = 0;
      }
    }
    for (let i = 0; i < 9; i += 3) {
      for (let j = 0; j < 9; j += 3) {
        let found = false;
        while (!found) {
          let num = parseInt(Math.random() * 9);
          if (isSafe(grid, i, j + (i / 3), num)) {
            grid[i][j + (i / 3)] = num;
            found = true;
          }
        }
      }
    }

    this.setState({ grid: grid }, async () => {
      await this.solveItFast();
      grid = deepCopy(this.state.grid);

      for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
          if (Math.random() > 0.5) grid[i][j] = 0;
        }
      }
      anime({
        targets: ".flex-center .col",
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100, { grid: [9, 9], from: "center" })
      })
      this.setState({ grid: grid });

    });
  }

  isValid = (grid) => {
    for (let i = 0; i < 9; ++i) {
      for (let j = 0; j < 9; ++j) {
        if (grid[i][j] != 0) {
          if (!isSafe(grid, i, j, grid[i][j])) {
            console.log("Invalid Sudoku !!");
            return false;
          }
        }

      }
    }
    return true;
  }

  changeNumber = (e, i, j) => {
    let newGrid = deepCopy(this.state.grid);
    newGrid[i][j] = e.target.value % 10;
    anime({
      targets: e.target,
      scale: [0.5, 1],
      duration: 400
    })

    this.setState({ grid: newGrid });
  }

  solveItFast = () => {
    this.setState({
      solutions: [],
      solving: true,
      solved: false,
      InvalidSudoku: false,
      moves: null,
      wrong: null,
      noSolution: false,
      moreThan5: false
    })

    let tmp = deepCopy(this.state.grid);
    if (!this.isValid(tmp)) {
      this.setState({ InvalidSudoku: true });
      return
    }

    let wrong_guess = 0;
    let total_moves = 0;
    let solutions = [];

    const solveFast = (grid) => {
      for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
          if (grid[i][j] == 0) {
            for (let x = 1; x < 10; ++x) {
              if (isSafe(grid, i, j, x)) {
                total_moves++;
                grid[i][j] = x;
                if (solveFast(grid)) {
                  return true;
                }
                wrong_guess++;
                grid[i][j] = 0;
              }
            }
            return false;
          }
        }
      }
      console.log(`Done with ${total_moves} moves and ${wrong_guess} wrong guesses`)
      this.setState({ moves: total_moves, wrong: wrong_guess, solved: true, solving: false });
      this.setState({ grid: grid });
      let solution = deepCopy(grid);
      if (solutions.length > 5) {
        console.log("More than 5 solutions Exist for this Sudoku.")
        this.setState({ moreThan5: true });
        return true;
      }
      solutions.push(solution)
      this.setState({ solutions: solutions });
      return this.state.oneSolution
    }
    if (solveFast(tmp) == false) {
      console.log("NO More Solution")
      this.setState({ noSolution: true })
    }

  }

  solveItSlow = () => {
    this.setState({
      solutions: [null],
      solving: true,
      solved: false,
      InvalidSudoku: false,
      moves: null,
      wrong: null,
      noSolution: false,
      moreThan5: false
    })
    let tmp = deepCopy(this.state.grid);
    if (!this.isValid(tmp)) {
      this.setState({ InvalidSudoku: true });
      return
    }

    let wrong_guess = 0;
    let total_moves = 0;
    let solutions = [];

    const solveSlow = async (grid) => {
      for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
          if (grid[i][j] == 0) {
            for (let x = 1; x < 10; ++x) {
              if (isSafe(grid, i, j, x)) {
                total_moves++;
                grid[i][j] = x;
                this.setState({ grid: grid });
                if (await new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve(solveSlow(grid))
                  }, SLOW_DELAY)
                })) {
                  return true;
                }
                wrong_guess++;
                grid[i][j] = 0;
                this.setState({ grid: grid });
              }
            }
            return false;
          }
        }
      }
      console.log(`Done with ${total_moves} moves and ${wrong_guess} wrong guesses`)
      this.setState({ moves: total_moves, wrong: wrong_guess, solved: true, solving: false });
      let solution = deepCopy(grid);
      if (solutions.length > 5) {
        console.log("More than 5 solutions Exist for this Sudoku.")
        this.setState({ moreThan5: true });
        return true;
      }
      solutions.push(solution)
      this.setState({ solutions: solutions });
      return this.state.oneSolution
    }

    if (solveSlow(tmp) == false) {
      console.log("NO Solution")
      this.setState({ noSolution: true })
    }


  }

  clear = () => {
    this.setState({
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    });
  }

  render() {

    let solutions = null;
    if (this.state.solutions.length) {
      solutions = this.state.solutions.map((sol, i) => <div key={i} className="solution"><Sudoku grid={sol} /></div>)
    }

    return (<>
      <main>
        <h1>Sudoku Solver</h1>
        <div className="sudo">
          <div className="info">
            <h2>Rules</h2>
            <p>
              Fill the empty cells with numbers [1,9] such that Each row, column and (3x3) block must contain each number from 1 to 9 exactly once.
            </p>
            <h2>Backtracking Algorithm <small>(Recursion)</small></h2>
            <p>
              Like all other Backtracking problems, we can solve Sudoku by one by one assigning numbers to empty cells.
              Before assigning a number, we check whether it is safe to assign. We basically check that the same number
              is not present in the current row, current column and current 3X3 subgrid. After checking for safety, we
              assign the number, and recursively check whether this assignment leads to a solution or not. If the assignment
              doesn’t lead to a solution, then we try the next number for the current empty cell. And if none of the number (1 to 9)
              leads to a solution, we return false.
              </p>
            <pre>
              <code className="language-python">
                {`def isSafe(grid, i, j, x):
  for k in range(9):
      if(grid[i][k] == x):
          return False
      if(grid[k][j] == x):
          return False
  for a in range(3):
      for b in range(3):
          if(grid[(i//3) * 3 + a][(j//3) * 3 + b] == x):
              return False
  return True


def solve(grid):
  for i in range(9):
      for j in range(9):
          if grid[i][j] == 0:
              for x in range(1, 10):
                  if isSafe(grid, i, j, x):
                      grid[i][j] = x
                      solve(grid)
                      grid[i][j] = 0
              return
  print(grid)`}
              </code>
            </pre>
          </div>
          <div className="flex-center">
            <Sudoku
              grid={this.state.grid}
              solvable
              clear={this.clear}
              new={this.generate}
              singleToggle={() => this.setState({ oneSolution: !this.state.oneSolution })}
              oneSolution={this.state.oneSolution}
              solveItSlow={this.solveItSlow}
              solveItFast={this.solveItFast}
              onChange={this.changeNumber}
            />
            {this.state.InvalidSudoku ? <div className="invalid">Invalid Sudoku</div> : null}
          </div>

        </div>

        {this.state.moves ? <div className="status">{`Done with ${this.state.moves} moves and ${this.state.wrong} wrong guesses`}</div> : null}
        {this.state.solutions.length > 5 ? <div className="more">More than 5 solutions...</div> : null}
        <div className="solutions">
          {solutions}
        </div>
      </main>
      <div className="footer">
        made with love by <b>Rohit Kaushal</b>
      </div>
    </>)
  }
};
