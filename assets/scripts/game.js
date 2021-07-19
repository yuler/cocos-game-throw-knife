cc.Class({
    extends: cc.Component,

    properties: {
        targetNode: cc.Node,
        knifeNode: cc.Node,
        knifePerfab: cc.Prefab
    },

    onLoad() {
        this.targetNode.zIndex = 1
        this.canThrow = true
        this.targetRotation = 3
        this.knifeNodeArray = []

        this.node.on('touchstart', this.throwKnife, this)
        setInterval(() => {
            this.changeSpeed()
        }, 2);
    },

    onDestroy() {
        this.node.off('touchstart', this.throwKnife, this)
    },

    update() {
        this.targetNode.angle = (this.targetNode.angle + this.targetRotation) % 360

        for (let knifeNode of this.knifeNodeArray) {
            knifeNode.angle = (knifeNode.angle + this.targetRotation) % 360

            let rad = Math.PI * (knifeNode.angle - 90) / 180
            let r = this.targetNode.width / 2
            knifeNode.x = this.targetNode.x + r * Math.cos(rad)
            knifeNode.y = this.targetNode.y + r * Math.sin(rad)
        }
    },

    changeSpeed() {
        let dir = Math.random() > 0.5 ? 1 : -1
        let speed = Math.random() * 4 
        this.targetRotation = dir * speed
    },

    throwKnife() {
        if (this.canThrow) {
            this.canThrow = false

            this.knifeNode.runAction(cc.sequence(
                cc.moveTo(0.15, cc.v2(this.knifeNode.x, this.targetNode.y - this.targetNode.width / 2)),
                cc.callFunc(() => {
                    let isHit = false
                    let gap = 10

                    for (let knifeNode of this.knifeNodeArray) {
                        if (Math.abs(knifeNode.angle) < gap || (360 - Math.abs(knifeNode.angle)) < gap) {
                            isHit = true
                            break
                        }
                    }

                    if (isHit) {
                        this.knifeNode.runAction(cc.sequence(
                            cc.spawn(
                                cc.moveTo(0.25, cc.v2(this.knifeNode.x, -cc.winSize.height)),
                                cc.rotateTo(0.25, 30)
                            ),
                            cc.callFunc(() => {
                                console.log('Game over')
                                cc.director.loadScene('game')
                            })
                        ))
                    } else {
                        let knifeNode = cc.instantiate(this.knifePerfab)
                        knifeNode.setPosition(this.knifeNode.position)
                        this.node.addChild(knifeNode)

                        this.knifeNode.setPosition(cc.v2(0, -300))

                        this.knifeNodeArray.push(knifeNode)

                        this.canThrow = true
                    }
                })
            ))
        }
    }
});
