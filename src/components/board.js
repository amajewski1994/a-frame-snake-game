export const boardComponent = {
    schema: {
        size: { default: 5 },
    },
    init() {
        const boardElements = document.getElementById('board-elements')
        const boardPlanes = document.getElementById('board-planes')

        const { size } = this.data
        const gridSize = size * size

        let x = 0
        let z = 0

        const createPlane = (index) => {
            const plane = document.createElement('a-plane')
            plane.setAttribute('id', `board-plane-${index}`)
            plane.setAttribute('class', 'board-plane')
            plane.setAttribute('position', `${x.toFixed(2)} ${0} ${z.toFixed(2)}`)
            plane.setAttribute('rotation', '-90 0 0')
            plane.setAttribute('color', 'white')
            plane.setAttribute('opacity', '0.75')

            boardPlanes.appendChild(plane)

            x += 1.1
            if (x >= size) {
                x = 0
                z -= 1.1
            }
        }

        const createBoard = () => {
            for (let i = 0; i < gridSize; i++) {
                createPlane(i)
            }

            const boardPos = (1.1 * (size - 1)) / 2
            boardElements.setAttribute('position', `-${boardPos} 0 ${boardPos}`)
        }

        createBoard()
    },
}
