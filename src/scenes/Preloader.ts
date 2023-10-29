import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    preload() {
        // Load the PNG map (tileset image)
        this.load.image('tiles', 'assets/dungeons/dungeon_tiles_extruded.png')

        // Load the JSON ile
        this.load.tilemapTiledJSON('dungeon', 'assets/dungeons/dungeon-01.json')

        // Load Atlas for character animation
        this.load.atlas(
            'fauna',
            'assets/characters/fauna.png',
            'assets/characters/fauna.json'
        )

        // Load Atlas for ennemies animation
        this.load.atlas(
            'lizard',
            'assets/ennemies/blobus.png',
            'assets/ennemies/blobus.json'
        )

        this.load.atlas(
            'treasure',
            'assets/items/treasure.png',
            'assets/items/treasure.json'
        )

        // Load the PNG image (Wizard)
        this.load.image('merlin', 'assets/characters/merlin.png')

        // Loading hearts image
        this.load.image('ui-heart-empty', 'assets/ui/ui_heart_empty.png')
        this.load.image('ui-heart-full', 'assets/ui/ui_heart_full.png')

        // Loading knife image
        this.load.image('knife', 'assets/weapons/weapon_knife.png')
    }

    create() {
        this.scene.start('game')
    }
}
