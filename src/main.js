import './style.css'
// import AFRAME from 'aframe';

import { boardComponent } from './components/board'
AFRAME.registerComponent('board', boardComponent)

import { snakeComponent } from './components/snake'
AFRAME.registerComponent('snake', snakeComponent)

import { directionComponent } from './components/directionButtons'
AFRAME.registerComponent('direction', directionComponent)