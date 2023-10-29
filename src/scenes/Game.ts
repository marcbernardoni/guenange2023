import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createChestAnims } from '../anims/TreasureAnims'

// Ennemies
import Lizard from '../ennemies/Lizard'

// Character
import '../characters/Fauna'
import Fauna from '../characters/Fauna'

// Items
import Chest from '../items/Chest'

// Events
import { sceneEvents } from '../events/EventsCenter'

export default class Game extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

    private fauna!: Fauna

    private knives!: Phaser.Physics.Arcade.Group
    private lizards!: Phaser.Physics.Arcade.Group

    private playerLizardCollider?: Phaser.Physics.Arcade.Collider

    constructor() {
        super('game')
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    create() {
        this.scene.run('game-ui')
        createLizardAnims(this.anims)
        createCharacterAnims(this.anims)
        createChestAnims(this.anims)

        // Create the Tilemap from 2d array
        const map = this.make.tilemap({ key: 'dungeon' })
        const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16, 1, 2)

        // Ground
        map.createLayer('Ground', tileset)

        // Walls
        const wallsLayer = map.createLayer('Walls', tileset)
        wallsLayer.setCollisionByProperty({ collides: true })

        // Chests
        const chests = this.physics.add.staticGroup({
            classType: Chest,
        })

        const chestsLayer = map.getObjectLayer('Chests')
        chestsLayer.objects.forEach((chestObj) => {
            chests.get(
                chestObj.x! + chestObj.width! * 0.5,
                chestObj.y! - chestObj.height! * 0.5,
                'treasure'
            )
        })
        // Visual debug for walls collision
        // debugDraw(wallsLayer, this)

        // Create the Character
        this.fauna = this.add.fauna(128, 128, 'fauna')

        // Set the focus of the Camera on Character
        this.cameras.main.startFollow(this.fauna, true)

        // Create Ennemy (LIZARD)
        this.lizards = this.physics.add.group({
            classType: Lizard,
            createCallback: (go) => {
                const lizardGo = go as Lizard
                lizardGo.body.onCollide = true
            },
        })

        const lizardsLayer = map.getObjectLayer('Lizards')
        lizardsLayer.objects.forEach((lizObj) => {
            this.lizards.get(
                lizObj.x! + lizObj.width! * 0.5,
                lizObj.y! - lizObj.height! * 0.5,
                'lizard'
            )
        })

        // Create the Weapon (KNIFE)
        this.knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
        })

        this.fauna.setKnives(this.knives)

        // Collision Management
        this.physics.add.collider(this.fauna, wallsLayer)
        this.physics.add.collider(this.lizards, wallsLayer)

        // PLAYER vs CHEST
        this.physics.add.collider(
            this.fauna,
            chests,
            this.handlePlayerChestCollision,
            undefined,
            this
        )

        // KNIVES vs WALLS
        this.physics.add.collider(
            this.knives,
            wallsLayer,
            this.handleKnifeWallCollision,
            undefined,
            this
        )

        // KNIVES vs LIZARDS
        this.physics.add.collider(
            this.knives,
            this.lizards,
            this.handleKnifeLizardCollision,
            undefined,
            this
        )

        // PLAYER vs LIZARD
        this.playerLizardCollider = this.physics.add.collider(
            this.lizards,
            this.fauna,
            this.handlePlayerLizardCollision,
            undefined,
            this
        )
    }

    // PLAYER vs CHEST Manager
    private handlePlayerChestCollision(
        obj1: Phaser.GameObjects.GameObject,
        obj2: Phaser.GameObjects.GameObject
    ) {
        const chest = obj2 as Chest
        this.fauna.setChest(chest)
    }

    // PLAYER vs LIZARD Manager
    private handlePlayerLizardCollision(
        obj1: Phaser.GameObjects.GameObject,
        obj2: Phaser.GameObjects.GameObject
    ) {
        const lizard = obj2 as Lizard

        // Bounce
        const dx = this.fauna.x - lizard.x
        const dy = this.fauna.y - lizard.y
        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

        // Damage management
        this.fauna.handleDamage(dir)

        // Life mangement
        sceneEvents.emit('player-health-changed', this.fauna.health)

        // Death management
        if (this.fauna.health <= 0) {
            this.playerLizardCollider.destroy()
        }
    }

    // KNIFE vs LIZARD Manager
    private handleKnifeLizardCollision(
        obj1: Phaser.GameObjects.GameObject,
        obj2: Phaser.GameObjects.GameObject
    ) {
        this.knives.killAndHide(obj1)
        this.lizards.killAndHide(obj2)
    }

    // KNIFE vs WALL Manager
    private handleKnifeWallCollision(
        obj1: Phaser.GameObjects.GameObject,
        obj2: Phaser.GameObjects.GameObject
    ) {
        this.knives.killAndHide(obj1)
    }

    update(t: number, dt: number) {
        if (this.fauna) {
            this.fauna.update(this.cursors)
        }
    }
}
