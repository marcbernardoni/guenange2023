import Phaser from 'phaser'

import Chest from '../items/Chest'

import { sceneEvents } from '../events/EventsCenter'

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            fauna(
                x: number,
                y: number,
                texture: string,
                frame?: number | string
            )
        }
    }
}

enum HealthState {
    IDLE,
    DAMAGE,
    DEAD,
}

export default class Fauna extends Phaser.Physics.Arcade.Sprite {
    private healthState = HealthState.IDLE
    private damageTime = 0
    private _health = 3
    private _coins = 0

    private knives?: Phaser.Physics.Arcade.Group
    private activeChest?: Chest

    get health() {
        return this._health
    }

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: number | string
    ) {
        super(scene, x, y, texture, frame)

        this.anims.play('fauna-idle-down')
    }
    setKnives(knives: Phaser.Physics.Arcade.Group) {
        this.knives = knives
    }

    setChest(chest: Chest) {
        this.activeChest = chest
    }

    handleDamage(dir: Phaser.Math.Vector2) {
        if (this._health <= 0) {
            return
        }

        if (this.healthState === HealthState.DAMAGE) {
            return
        }

        --this._health

        if (this._health <= 0) {
            // TODO: Die
            this.healthState = HealthState.DEAD
            this.anims.play('fauna-faint')
            this.setVelocity(0, 0)
        } else {
            this.setVelocity(dir.x, dir.y)

            this.setTint(0xff0000)
            this.healthState = HealthState.DAMAGE
            this.damageTime = 0
        }
    }

    // Knife throwing manager
    private throwKnife() {
        // if (!this.knives) {
        //     return
        // }

        const parts = this.anims.currentAnim.key.split('-')
        const direction = parts[2]

        // Get the direction where face the Player
        const vector = new Phaser.Math.Vector2(0, 0)
        switch (direction) {
            case 'up':
                vector.y = -1
                break
            case 'down':
                vector.y = 1
                break
            case 'side':
                if (this.scaleX < 0) {
                    vector.x = -1
                } else {
                    vector.x = 1
                }
                break
        }

        const angle = vector.angle()
        const knife = this.knives.get(
            this.x,
            this.y,
            'knife'
        ) as Phaser.Physics.Arcade.Image

        knife.setActive(true)
        knife.setVisible(true)

        knife.setRotation(angle)
        knife.x += vector.x * 16
        knife.y += vector.y * 16

        knife.setVelocity(vector.x * 300, vector.y * 300)
    }

    preUpdate(t: number, dt: number) {
        super.preUpdate(t, dt)

        // State Machine
        switch (this.healthState) {
            case HealthState.IDLE:
                break
            case HealthState.DEAD:
                break
            case HealthState.DAMAGE:
                this.damageTime += dt
                if (this.damageTime >= 250) {
                    this.healthState = HealthState.IDLE
                    this.setTint(0xffffff)
                    this.damageTime = 0
                }
                break
        }
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (
            this.healthState === HealthState.DAMAGE ||
            this.healthState === HealthState.DEAD
        ) {
            return
        }

        // No input key
        if (!cursors) {
            return
        }

        // Open chest OR Knives throwing
        if (Phaser.Input.Keyboard.JustDown(cursors.space!)) {
            console.log(this.activeChest)
            if (this.activeChest) {
                const coins = this.activeChest.open()
                this._coins += coins

                sceneEvents.emit('player-coins-changed', this._coins)
            } else {
                this.throwKnife()
            }
            return
        }

        // Speed deplacement
        const speed = 100

        const leftDown = cursors.left?.isDown
        const rightDown = cursors.right?.isDown
        const upDown = cursors.up?.isDown
        const downDown = cursors.down?.isDown

        // Keyboard Management
        if (leftDown) {
            this.anims.play('fauna-run-side', true)
            this.setVelocity(-speed, 0)
            this.body.setOffset(24, 6)
            this.scaleX = -1
        } else if (rightDown) {
            this.anims.play('fauna-run-side', true)
            this.setVelocity(speed, 0)
            this.body.setOffset(8, 6)
            this.scaleX = 1
        } else if (upDown) {
            this.anims.play('fauna-run-up', true)
            this.setVelocity(0, -speed)
            this.body.offset.y = 6
        } else if (downDown) {
            this.anims.play('fauna-run-down', true)
            this.setVelocity(0, speed)
            this.body.offset.y = 6
        } else {
            const parts = this.anims.currentAnim.key.split('-')
            parts[1] = 'idle'
            this.anims.play(parts.join('-'))
            this.setVelocity(0, 0)
        }

        if (leftDown || rightDown || upDown || downDown) {
            this.activeChest = undefined
        }
    }
}

Phaser.GameObjects.GameObjectFactory.register(
    'fauna',
    function (
        this: Phaser.GameObjects.GameObjectFactory,
        x: number,
        y: number,
        texture: string,
        frame?: number | string
    ) {
        const sprite = new Fauna(this.scene, x, y, texture, frame)

        this.displayList.add(sprite)
        this.updateList.add(sprite)

        this.scene.physics.world.enableBody(
            sprite,
            Phaser.Physics.Arcade.DYNAMIC_BODY
        )

        sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8)
        return sprite
    }
)
