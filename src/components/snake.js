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
            for (let i = data.directionArr.length - 1; i >= 0; i--) {
                if (i === 0) break
                data.directionArr[i] = data.directionArr[i - 1]
            }

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

        function nearestPoint(object3D) {
            const { x, y, z } = object3D.position
            const count = size * 2 + 1

            function snap(value, origin, step) {
                const rawIndex = Math.round((value - origin) / step)
                const i = Math.max(0, Math.min(count - 1, rawIndex))
                return origin + i * step
            }

            const snappedX = snap(x, -addVal, +addVal)
            const snappedZ = snap(z, +addVal, -addVal)

            const nearest = new THREE.Vector3(snappedX, 0, snappedZ)
            return nearest
        }

        const createChild = (dir, nearestVec) => {
            const sphere = document.createElement('a-sphere')
            this.el.appendChild(sphere)
            sphere.setAttribute('scale', '0.3 0.3 0.3')
            sphere.setAttribute('color', 'red')
            sphere.setAttribute('id', `tail-${data.points - 1}`)
            sphere.setAttribute('class', 'tail')
            sphere.setAttribute('dynamic-body', 'mass: 0; shape: sphere; sphereRadius: 0.1;')

            let newPos = '0 0 0'

            if (dir === 'RIGHT') {
                const newX = nearestVec.x - addVal
                newPos = `${newX} 0 ${nearestVec.z}`
            } else if (dir === 'LEFT') {
                const newX = nearestVec.x + addVal
                newPos = `${newX} 0 ${nearestVec.z}`
            } else if (dir === 'UP') {
                const newZ = nearestVec.z + addVal
                newPos = `${nearestVec.x} 0 ${newZ}`
            } else if (dir === 'DOWN') {
                const newZ = nearestVec.z - addVal
                newPos = `${nearestVec.x} 0 ${newZ}`
            }
            data.directionArr.push(dir)

            sphere.setAttribute('position', newPos)
        }

        const randomPos = () => {
            const spacing = 1.1;
            const center = (size - 1) / 2;

            const positions = Array.from({ length: size }, (_, i) => (i - center) * spacing);

            const x = positions[Math.floor(Math.random() * positions.length)];
            const z = positions[Math.floor(Math.random() * positions.length)];

            for (const child of this.el.children) {
                const childPosition = child.getAttribute('position');
                if (
                    Math.abs(childPosition.x - x) <= 0.01 &&
                    Math.abs(childPosition.z - z) <= 0.01
                ) {
                    return randomPos();
                }
            }

            return `${x} 0 ${z}`;
        };

        head.addEventListener('collide', async (e) => {
            if (data.gameover) return
            const collEl = await e.detail.body.el
            const collElId = await collEl.getAttribute('id')

            if (collElId && collElId.includes('tail')) {
                console.log('gameover')
                data.gameover = true

                for (let i = 0; i < this.el.children.length; i++) {
                    this.el.children[i].removeAttribute('animation__position')
                    const position = this.el.children[i].getAttribute('position')
                    this.el.children[i].setAttribute('position', position)
                }
                return
            }

            data.points++

            // NEW CHILD
            const { lastElementChild } = await this.el
            const lastDir = data.directionArr[data.directionArr.length - 1]
            const nearestVec = await nearestPoint(lastElementChild.object3D)
            createChild(lastDir, nearestVec)

            // NEW POINT POSITION
            const newPos = await randomPos()
            await collEl.setAttribute('position', newPos)
        })

        moveSnake()

        head.addEventListener('animationcomplete__position', moveSnakeFinishHandler)
    },
}
