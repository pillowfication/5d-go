const WALL = {
  HORIZONTAL: 0,
  VERTICAL: 1
}

class Game2P {
  constructor (rows = 9, cols = 9, walls = 10) {
    Object.assign(this, { rows, cols, walls })

    this.player1 = { r: rows - 1, c: cols - (cols >> 1), walls: this.walls }
    this.player2 = { r: 0, c: cols >> 1, walls: this.walls }
    this.placedWalls = new Map()
    this.turnCounter = 0
  }

  hasWall (orientation, r, c) {
    const wall = this.placedWalls.get(`${r},${c}`)
    return wall ? (wall.orientation === orientation) : false
  }

  hasEdge (r1, c1, r2, c2) {
    if (r2 < 0 || r2 >= this.rows || c2 < 0 || c2 >= this.cols) {
      return false
    }
    if (r1 === r2) {
      return !this.hasWall(WALL.VERTICAL, r1, c1) && !this.hasWall(WALL.VERTICAL, r1 - 1, c1)
    } else /* if (c1 === c2) */ {
      return !this.hasWall(WALL.HORIZONTAL, r1, c1) && !this.hasWall(WALL.HORIZONTAL, r1, c1 - 1)
    }
  }

  canPlaceWall (orientation, r, c) {
    // Check collision
    if (this.hasWall(WALL.HORIZONTAL, r, c) || this.hasWall(WALL.VERTICAL, r, c)) {
      return false
    }
    if (orientation === WALL.HORIZONTAL &&
      (this.hasWall(WALL.HORIZONTAL, r, c - 1) || this.hasWall(WALL.HORIZONTAL, r, c + 1))
    ) {
      return false
    }
    if (/* orientation === WALL.VERTICAL && */
      (this.hasWall(WALL.VERTICAL, r - 1, c) || this.hasWall(WALL.VERTICAL, r + 1, c))
    ) {
      return false
    }

    // Check pathing
    function getValidNeighbors (r, c) {
      const valid = []
      if (this.hasEdge(r, c, r - 1, c)) {
        valid.push({ r: r - 1, c })
      }
      if (this.hasEdge(r, c, r, c + 1)) {
        valid.push({ r, c: c + 1 })
      }
      if (this.hasEdge(r, c, r + 1, c)) {
        valid.push({ r: r + 1, c })
      }
      if (this.hasEdge(r, c, r, c - 1)) {
        valid.push({ r, c: c - 1 })
      }
      return valid
    }

    let p1max = this.player1.r
    const player1Boundary = []
    const player1Visited = {}
    for (let cell = { r: this.player1.r, c: this.player1.c }; cell; cell = player1Boundary.pop()) {
      const neighbors = getValidNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = `${neighbor.r},${neighbor.c}`
        if (!player1Visited[key]) {
          player1Visited[key] = true
          player1Boundary.push(neighbor)
          p1max = this.min(p1max, neighbor.r)
        }
      }
    }
    if (p1max !== 0) {
      return false
    }

    let p2max = this.player2.r
    const player2Boundary = []
    const player2Visited = {}
    for (let cell = { r: this.player2.r, c: this.player2.c }; cell; cell = player2Boundary.pop()) {
      const neighbors = getValidNeighbors(cell.r, cell.c)
      for (const neighbor of neighbors) {
        const key = `${neighbor.r},${neighbor.c}`
        if (!player2Visited[key]) {
          player2Visited[key] = true
          player2Boundary.push(neighbor)
          p2max = this.max(p2max, neighbor.r)
        }
      }
    }
    if (p2max !== this.rows - 1) {
      return false
    }

    return true
  }

  getValidMoves (player) {
    const self = player === 1 ? this.player1 : this.player2
    const other = player === 1 ? this.player2 : this.player1
    const validMoves = []

    if (this.hasEdge(self.r, self.c, self.r - 1, self.c)) {
      if (self.r - 1 === other.r && self.c === other.c) {
        if (this.hasEdge(self.r - 1, self.c, self.r - 2, self.c)) {
          validMoves.push({ r: self.r - 2, c: self.c })
        } else {
          if (this.hasEdge(self.r - 1, self.c, self.r - 1, self.c - 1)) {
            validMoves.push(self.r - 1, self.c - 1)
          }
          if (this.hasEdge(self.r - 1, self.c, self.r - 1, self.c + 1)) {
            validMoves.push(self.r - 1, self.c + 1)
          }
        }
      } else {
        validMoves.push({ r: self.r - 1, c: self.c })
      }
    }
    if (this.hasEdge(self.r, self.c, self.r, self.c + 1)) {
      if (self.r === other.r && self.c + 1 === other.c) {
        if (this.hasEdge(self.r, self.c + 1, self.r, self.c + 2)) {
          validMoves.push({ r: self.r, c: self.c + 2 })
        } else {
          if (this.hasEdge(self.r, self.c + 1, self.r - 1, self.c + 1)) {
            validMoves.push(self.r - 1, self.c - 1)
          }
          if (this.hasEdge(self.r, self.c + 1, self.r + 1, self.c + 1)) {
            validMoves.push(self.r + 1, self.c + 1)
          }
        }
      } else {
        validMoves.push({ r: self.r, c: self.c + 1 })
      }
    }
    if (this.hasEdge(self.r, self.c, self.r + 1, self.c)) {
      if (self.r + 1 === other.r && self.c === other.c) {
        if (this.hasEdge(self.r + 1, self.c, self.r + 2, self.c)) {
          validMoves.push({ r: self.r + 2, c: self.c })
        } else {
          if (this.hasEdge(self.r + 1, self.c, self.r + 1, self.c + 1)) {
            validMoves.push(self.r + 1, self.c + 1)
          }
          if (this.hasEdge(self.r + 1, self.c, self.r + 1, self.c - 1)) {
            validMoves.push(self.r + 1, self.c - 1)
          }
        }
      } else {
        validMoves.push({ r: self.r + 1, c: self.c })
      }
    }
    if (this.hasEdge(self.r, self.c, self.r, self.c - 1)) {
      if (self.r === other.r && self.c - 1 === other.c) {
        if (this.hasEdge(self.r, self.c - 1, self.r, self.c - 2)) {
          validMoves.push({ r: self.r, c: self.c - 2 })
        } else {
          if (this.hasEdge(self.r, self.c - 1, self.r + 1, self.c - 1)) {
            validMoves.push(self.r + 1, self.c - 1)
          }
          if (this.hasEdge(self.r, self.c - 1, self.r - 1, self.c - 1)) {
            validMoves.push(self.r - 1, self.c - 1)
          }
        }
      } else {
        validMoves.push({ r: self.r, c: self.c - 1 })
      }
    }
  }
}

module.exports = Game2P
