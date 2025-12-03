import { data } from "../config/data"

export const snakeComponent = {
    schema: {
        size: { default: 5 },
    },
    init() {
        const { size } = this.data
        const addVal = 0.55
        const maxPos = ((size - 1) * 1.1) + addVal
        const duration = 500
        const head = this.el.children[0]

        const moveSnake = () => {
            data.moveIndex++
            if (data.moveIndex % 2 !== 0) data.directionArr[0] = data.direction
            for (let i = 0; i < this.el.children.length; i++) {
                const actualPos = this.el.children[i].getAttribute('position')
                let x = parseFloat((Math.round(actualPos.x * 100) / 100).toFixed(2))
                let z = parseFloat((Math.round(actualPos.z * 100) / 100).toFixed(2))

                if (data.directionArr[i] === 'RIGHT') {
                    if (Math.abs(x - maxPos) <= 0.01) x = -addVal
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x + addVal} 0 ${z}; easing: linear; dur: ${duration + (this.el.children.length * 10)}`)
                } else if (data.directionArr[i] === 'LEFT') {
                    if (Math.abs(x - (0 - addVal)) <= 0.01) x = maxPos
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x - addVal} 0 ${z}; easing: linear; dur: ${duration + (this.el.children.length * 10)}`)
                } else if (data.directionArr[i] === 'UP') {
                    if (Math.abs(z - (maxPos * -1)) <= 0.01) z = addVal
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x} 0 ${z - addVal}; easing: linear; dur: ${duration + (this.el.children.length * 10)}`)
                } else if (data.directionArr[i] === 'DOWN') {
                    if (Math.abs(z - (0 + addVal)) <= 0.01) z = -maxPos
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x} 0 ${z + addVal}; easing: linear; dur: ${duration + (this.el.children.length * 10)}`)
                } else {
                    console.log('Unknown direction')
                }
            }
        }

        const moveSnakeFinishHandler = () => {
            moveSnake()
        }

        moveSnake()

        head.addEventListener('animationcomplete__position', moveSnakeFinishHandler)
    },
}
