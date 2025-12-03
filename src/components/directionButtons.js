import { data } from '../config/data'

export const directionComponent = {
    init() {
        const directionRightButton = document.getElementById('directionRightButton')
        const directionLeftButton = document.getElementById('directionLeftButton')

        const directionButtonHandler = (buttonDir) => {
            data.dirId = buttonDir === 'RIGHT' ? (data.dirId + 1) : (data.dirId - 1)
            if (data.dirId > 3) data.dirId = 0
            if (data.dirId < 0) data.dirId = 3
            if (data.dirId === 0) {
                data.direction = 'RIGHT'
            } else if (data.dirId === 1) {
                data.direction = 'DOWN'
            } else if (data.dirId === 2) {
                data.direction = 'LEFT'
            } else if (data.dirId === 3) {
                data.direction = 'UP'
            } else {
                console.log('Unknown direction id')
            }
            console.log(data.dirId)
        }

        directionRightButton.addEventListener('click', () => directionButtonHandler('RIGHT'))
        directionLeftButton.addEventListener('click', () => directionButtonHandler('LEFT'))
    },
}
