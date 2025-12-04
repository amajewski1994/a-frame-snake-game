import { disposeEntity } from '../shared/dispose'
import { data } from '../config/data'

export const UIComponent = {
    init() {
        const startButton = document.getElementById('button-start')
        const retryButton = document.getElementById('button-retry')
        const point = document.getElementById('point')
        const snakeContainer = document.getElementById('snake-container')
        const mainContainer = document.getElementById('main-container')
        const directionContainer = document.getElementById('direction-container')

        mainContainer.style.display = 'block'

        const hideMainContainer = () => {
            mainContainer.style.opacity = 0
            mainContainer.style.pointerEvents = 'none'

            setTimeout(() => {
                mainContainer.style.display = 'none'
            }, 1000)
        }

        const restart = () => {
            snakeContainer.children[0].setAttribute('position', '0 0 0')
            point.setAttribute('position', '1.1 0 2.2')

            const tail = document.getElementsByClassName('tail')
            Array.from(tail).forEach((el) => {
                disposeEntity(el)
            })

            data.direction = 'RIGHT'
            data.gameover = false
            data.points = 0
            data.moveIndex = 0
            data.directionArr = ['RIGHT']
            data.dirId = 0

            snakeContainer.setAttribute('snake', 'isMoving: false')

            hideMainContainer()
        }

        const startGame = () => {
            startButton.removeEventListener('click', startGame)
            hideMainContainer()

            directionContainer.style.display = 'flex'
            setTimeout(() => {
                directionContainer.style.opacity = 1
            })

            setTimeout(() => {
                snakeContainer.setAttribute('snake', 'isMoving: true')
            }, 1000)

        }

        const retryGame = () => {
            restart()

            setTimeout(() => {
                snakeContainer.setAttribute('snake', 'isMoving: true')
            }, 2000)
        }

        startButton.addEventListener('click', startGame)
        retryButton.addEventListener('click', retryGame)
    },
}
