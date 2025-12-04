import { data } from "../config/data"

export const snakeComponent = {
    schema: {
        size: { default: 5 },
        isMoving: { default: false },
    },
    init() {
        const { size } = this.data
        const addVal = 0.55
        const maxPos = ((size - 1) * 1.1) + addVal
        const duration = 500
        const head = this.el.children[0]

        const mainContainer = document.getElementById('main-container')
        const instructionContainer = document.getElementById('instruction-container')
        const endScreenContainer = document.getElementById('end-screen-container')
        const endScreenPoints = document.getElementById('end-screen-points')

        this.moveSnake = () => {
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
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x + addVal} 0 ${z}; easing: easeInOutQuad; dur: ${duration + (this.el.children.length * 10)}`)
                } else if (data.directionArr[i] === 'LEFT') {
                    if (Math.abs(x - (0 - addVal)) <= 0.01) x = maxPos
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x - addVal} 0 ${z}; easing: easeInOutQuad; dur: ${duration + (this.el.children.length * 10)}`)
                } else if (data.directionArr[i] === 'UP') {
                    if (Math.abs(z - (maxPos * -1)) <= 0.01) z = addVal
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x} 0 ${z - addVal}; easing: easeInOutQuad; dur: ${duration + (this.el.children.length * 10)}`)
                } else if (data.directionArr[i] === 'DOWN') {
                    if (Math.abs(z - (0 + addVal)) <= 0.01) z = -maxPos
                    this.el.children[i].setAttribute('animation__position', `property: position; from: ${x} 0 ${z}; to: ${x} 0 ${z + addVal}; easing: easeInOutQuad; dur: ${duration + (this.el.children.length * 10)}`)
                } else {
                    console.log('Unknown direction')
                }
            }
        }

        const moveSnakeFinishHandler = () => {
            this.moveSnake()
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
            sphere.setAttribute('color', 'darkred')
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

        const gameOver = async () => {
            data.gameover = true
            instructionContainer.style.display = 'none'
            endScreenContainer.style.display = 'block'
            mainContainer.style.display = 'block'

            endScreenPoints.innerHTML = `You've scored ${data.points} points`
            setTimeout(() => {
                mainContainer.style.opacity = 1
            })
        }

        head.addEventListener('collide', async (e) => {
            if (data.gameover) return
            const collEl = await e.detail.body.el
            const collElId = await collEl.getAttribute('id')

            if (collElId && collElId.includes('tail')) {
                gameOver()

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

        head.addEventListener('animationcomplete__position', moveSnakeFinishHandler)
    },
    update() {
        if (this.data.isMoving) this.moveSnake()
    },
}


// import { data } from "../config/data"

// export const snakeComponent = {
//     schema: {
//         size: { default: 5 },
//         isMoving: { default: false },
//     },
//     init() {
//         const { size } = this.data
//         const addVal = 0.55
//         const maxPos = ((size - 1) * 1.1) + addVal
//         const duration = 500 // czas jednego „półkroku” jak wcześniej
//         const head = this.el.children[0]

//         // zapisujemy do this, żeby mieć w innych metodach
//         this.addVal = addVal
//         this.maxPos = maxPos
//         this.stepDuration = duration
//         this.lastStepTime = 0

//         const mainContainer = document.getElementById('main-container')
//         const instructionContainer = document.getElementById('instruction-container')
//         const endScreenContainer = document.getElementById('end-screen-container')
//         const endScreenPoints = document.getElementById('end-screen-points')

//         // docelowe pozycje (logika) – na nich operuje moveSnake
//         this.targets = []
//         for (let i = 0; i < this.el.children.length; i++) {
//             const pos = this.el.children[i].object3D.position
//             this.targets.push(pos.clone())
//         }

//         // GŁÓWNY RUCH – zmienia tylko this.targets, bez animacji A-Frame
//         this.moveSnake = () => {
//             const addVal = this.addVal

//             data.moveIndex++

//             // ogon przejmuje kierunek poprzednika
//             for (let i = data.directionArr.length - 1; i >= 0; i--) {
//                 if (i === 0) break
//                 data.directionArr[i] = data.directionArr[i - 1]
//             }

//             // co drugi krok aktualizujemy kierunek głowy (tak jak miałeś)
//             if (data.moveIndex % 2 !== 0) data.directionArr[0] = data.direction

//             // aktualizacja docelowych pozycji dla każdego segmentu
//             for (let i = 0; i < this.el.children.length; i++) {
//                 const dir = data.directionArr[i]
//                 const target = this.targets[i]

//                 let x = target.x
//                 let z = target.z

//                 if (dir === 'RIGHT') {
//                     if (Math.abs(x - this.maxPos) <= 0.01) x = -addVal
//                     target.set(x + addVal, 0, z)
//                 } else if (dir === 'LEFT') {
//                     if (Math.abs(x - (0 - addVal)) <= 0.01) x = this.maxPos
//                     target.set(x - addVal, 0, z)
//                 } else if (dir === 'UP') {
//                     if (Math.abs(z - (this.maxPos * -1)) <= 0.01) z = addVal
//                     target.set(x, 0, z - addVal)
//                 } else if (dir === 'DOWN') {
//                     if (Math.abs(z - (0 + addVal)) <= 0.01) z = -this.maxPos
//                     target.set(x, 0, z + addVal)
//                 } else {
//                     console.log('Unknown direction')
//                 }
//             }
//         }

//         function nearestPoint(object3D) {
//             const { x, y, z } = object3D.position
//             const count = size * 2 + 1
//             const addVal = 0.55

//             function snap(value, origin, step) {
//                 const rawIndex = Math.round((value - origin) / step)
//                 const i = Math.max(0, Math.min(count - 1, rawIndex))
//                 return origin + i * step
//             }

//             const snappedX = snap(x, -addVal, +addVal)
//             const snappedZ = snap(z, +addVal, -addVal)

//             const nearest = new THREE.Vector3(snappedX, 0, snappedZ)
//             return nearest
//         }

//         const createChild = (dir, nearestVec) => {
//             const sphere = document.createElement('a-sphere')
//             this.el.appendChild(sphere)
//             sphere.setAttribute('scale', '0.3 0.3 0.3')
//             sphere.setAttribute('color', 'red')
//             sphere.setAttribute('id', `tail-${data.points - 1}`)
//             sphere.setAttribute('class', 'tail')
//             sphere.setAttribute('dynamic-body', 'mass: 0; shape: sphere; sphereRadius: 0.1;')

//             let newPos = '0 0 0'
//             const addVal = this.addVal

//             if (dir === 'RIGHT') {
//                 const newX = nearestVec.x - addVal
//                 newPos = `${newX} 0 ${nearestVec.z}`
//             } else if (dir === 'LEFT') {
//                 const newX = nearestVec.x + addVal
//                 newPos = `${newX} 0 ${nearestVec.z}`
//             } else if (dir === 'UP') {
//                 const newZ = nearestVec.z + addVal
//                 newPos = `${nearestVec.x} 0 ${newZ}`
//             } else if (dir === 'DOWN') {
//                 const newZ = nearestVec.z - addVal
//                 newPos = `${nearestVec.x} 0 ${newZ}`
//             }

//             data.directionArr.push(dir)
//             sphere.setAttribute('position', newPos)

//             // dodajemy docelową pozycję dla nowego segmentu (żeby lerp miał punkt odniesienia)
//             const [x, , z] = newPos.split(' ').map(parseFloat)
//             this.targets.push(new THREE.Vector3(x, 0, z))
//         }

//         const randomPos = () => {
//             const spacing = 1.1
//             const center = (size - 1) / 2

//             const positions = Array.from({ length: size }, (_, i) => (i - center) * spacing)

//             const x = positions[Math.floor(Math.random() * positions.length)]
//             const z = positions[Math.floor(Math.random() * positions.length)]

//             for (const child of this.el.children) {
//                 const childPosition = child.getAttribute('position')
//                 if (
//                     Math.abs(childPosition.x - x) <= 0.01 &&
//                     Math.abs(childPosition.z - z) <= 0.01
//                 ) {
//                     return randomPos()
//                 }
//             }

//             return `${x} 0 ${z}`
//         }

//         const gameOver = async () => {
//             data.gameover = true
//             instructionContainer.style.display = 'none'
//             endScreenContainer.style.display = 'block'
//             mainContainer.style.display = 'block'

//             endScreenPoints.innerHTML = `You've scored ${data.points} points`
//             setTimeout(() => {
//                 mainContainer.style.opacity = 1
//             })

//             // zatrzymujemy węża – po prostu przestajemy ruszać w tick przez data.gameover
//             // opcjonalnie „zapieczemy” aktualne pozycje do atrybutów:
//             for (let i = 0; i < this.el.children.length; i++) {
//                 const objPos = this.el.children[i].object3D.position
//                 this.el.children[i].setAttribute('position', `${objPos.x} ${objPos.y} ${objPos.z}`)
//             }
//         }

//         head.addEventListener('collide', async (e) => {
//             if (data.gameover) return
//             const collEl = await e.detail.body.el
//             const collElId = await collEl.getAttribute('id')

//             if (collElId && collElId.includes('tail')) {
//                 gameOver()
//                 return
//             }

//             data.points++

//             // NEW CHILD
//             const { lastElementChild } = await this.el
//             const lastDir = data.directionArr[data.directionArr.length - 1]
//             const nearestVec = await nearestPoint(lastElementChild.object3D)
//             createChild(lastDir, nearestVec)

//             // NEW POINT POSITION
//             const newPos = await randomPos()
//             await collEl.setAttribute('position', newPos)
//         })

//         // UWAGA: NIE używamy już animationcomplete__position, więc bez tego:
//         // head.addEventListener('animationcomplete__position', moveSnakeFinishHandler)
//     },

//     // update już nie odpala moveSnake – ruchem steruje tylko tick
//     update() {
//         // ewentualnie można reagować na zmianę isMoving, ale bez moveSnake()
//     },

//     // płynny ruch za pomocą lerp
//     tick(time, timeDelta) {
//         if (!this.data.isMoving || data.gameover) return

//         // inicjalizacja czasu startu
//         if (this.lastStepTime === 0) {
//             this.lastStepTime = time
//         }

//         // jeśli minął czas kroku – aktualizujemy logiczne pozycje (targets)
//         if (time - this.lastStepTime >= this.stepDuration) {
//             // żeby nie „odpływać” – przed zmianą targetów ustawiamy je na aktualne pozycje świata,
//             // aby uniknąć ewentualnego dryfu
//             for (let i = 0; i < this.el.children.length; i++) {
//                 const objPos = this.el.children[i].object3D.position
//                 this.targets[i].set(objPos.x, objPos.y, objPos.z)
//             }

//             this.moveSnake()
//             this.lastStepTime = time
//         }

//         const progress = Math.min(1, (time - this.lastStepTime) / this.stepDuration)
//         const alpha = Math.min(1, timeDelta / this.stepDuration) || 0.0

//         // lerp w stronę docelowych pozycji
//         for (let i = 0; i < this.el.children.length; i++) {
//             const objPos = this.el.children[i].object3D.position
//             objPos.lerp(this.targets[i], alpha)
//         }
//     },
// }
