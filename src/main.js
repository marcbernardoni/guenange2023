import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import GameUi from './scenes/GameUI'

window.onload = () => {
    const gameOptions = {
        debug: true,
    }

    const gameConfig = {
        type: Phaser.AUTO,
        parent: 'app',
        width: 400,
        height: 250,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false,
            },
        },
        scale: {
            zoom: 2,
        },
        scene: [Preloader, Game, GameUi],
    }

    const game = new Phaser.Game(gameConfig)
    game.scene.start('Preloader')

    window.focus()
    // resizeGame()
    // window.addEventListener('resize', resizeGame)
}

const resizeGame = () => {
    const canvas = document.querySelector('canvas')
    const gameRatio = canvas.width / canvas.height

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const windowRatio = windowWidth / windowHeight

    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + 'px'
        canvas.style.height = windowWidth / gameRatio + 'px'
    } else {
        canvas.style.width = windowHeight * gameRatio + 'px'
        canvas.style.height = windowHeight + 'px'
    }
}
