import React, { Component } from "react"
import InputBox from "../InputBox/InputBox";
import "./Sudoku.css"
import { deepCopy, solve, isSafe } from "../../utils/utils"

class Sudoku extends Component {
    state = {
        grid: this.props.grid || [
            [3, 0, 6, 5, 0, 8, 4, 0, 0],
            [5, 2, 0, 0, 0, 0, 0, 0, 0],
            [0, 8, 7, 0, 0, 0, 0, 3, 1],
            [0, 0, 3, 0, 1, 0, 0, 8, 0],
            [9, 0, 0, 8, 6, 3, 0, 0, 5],
            [0, 5, 0, 0, 9, 0, 6, 0, 0],
            [1, 3, 0, 0, 0, 0, 2, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 7, 4],
            [0, 0, 5, 2, 0, 6, 3, 0, 0]
        ]
    }

    changeNumber = (e, i, j) => {
        let newGrid = deepCopy(this.state.grid);
        newGrid[i][j] = e.target.value;

        this.setState({ grid: newGrid });
    }

    solveItFast = () => {
        let tmp = deepCopy(this.state.grid);
        solve(tmp);
        this.setState({ grid: tmp });
    }

    solveItSlow = () => {
        let tmp = deepCopy(this.state.grid);
        let wrong_guess = 0;
        let total_moves = 0;
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
                                    }, 1)
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
            return true
        }

        solveSlow(tmp)

    }

    render() {
        let grid = this.props.grid || this.state.grid;
        return (

            <div className="sudoku">
                {this.props.solvable ? <button className="clear" onClick={this.props.clear}>Clear</button> : null}
                <div className="grid">
                    {grid.map((row, i) =>
                        <div key={i} className="row">
                            {row.map((cell, j) =>
                                <div key={j} className="col"> {<InputBox i={i} j={j} val={cell != 0 ? cell : ""} onChange={(e) => this.props.onChange ? this.props.onChange(e, i, j) : this.changeNumber(e, i, j)} />}</div>)}
                        </div>)}
                </div>
                <div className="solve">
                    {this.props.solvable ? <button className="single" onClick={this.props.singleToggle}>{this.props.oneSolution ? "Single Solution" : "Multiple Solutions"}</button> : null}
                    {this.props.solvable ? <button className="fast" onClick={this.props.solveItFast ? this.props.solveItFast : this.solveItFast}>Solve Fast</button> : null}
                    {this.props.solvable ? <button className="slow" onClick={this.props.solveItSlow ? this.props.solveItSlow : this.solveItSlow}>Solve Slow</button> : null}
                </div>
            </div>
        );
    }
}

export default Sudoku;
