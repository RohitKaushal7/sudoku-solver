export const deepCopy = (arr) => {
    let copy = [];
    arr.forEach(elem => {
        if (Array.isArray(elem)) {
            copy.push(deepCopy(elem))
        } else {
            copy.push(elem)
        }
    });
    return copy;
}

export const isSafe = (grid, i, j, x) => {
    for (let k = 0; k < 9; ++k) {
        if (j != k && grid[i][k] == x)
            return false
        if (i != k && grid[k][j] == x)
            return false
    }

    for (let a = 0; a < 3; ++a) {
        for (let b = 0; b < 3; ++b) {
            if (i != (Math.floor(i / 3) * 3 + a) && j != (Math.floor(j / 3) * 3 + b) && grid[Math.floor(i / 3) * 3 + a][Math.floor(j / 3) * 3 + b] == x)
                return false
        }
    }

    return true
}

export const solve = (grid) => {
    for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
            if (grid[i][j] == 0) {
                for (let x = 1; x < 10; ++x) {
                    if (isSafe(grid, i, j, x)) {
                        grid[i][j] = x;
                        if (solve(grid)) {
                            return true;
                        }
                        grid[i][j] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true
}