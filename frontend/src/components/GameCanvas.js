import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { useIrys } from "../contexts/IrysContext";
import { useToast } from "../hooks/use-toast";

const GameCanvas = ({ onGameOver }) => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const { uploadScore, walletAddress } = useIrys();
  const { toast } = useToast();
  const [gameScore, setGameScore] = useState(0);

  useEffect(() => {
    if (!gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#000011',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    let player;
    let aliens;
    let bullets;
    let alienBullets;
    let cursors;
    let spaceKey;
    let score = 0;
    let scoreText;
    let gameOver = false;
    let alienDirection = 1;
    let alienSpeed = 50;
    let alienDropDistance = 30;
    let lastAlienShot = 0;
    let lives = 3;
    let livesText;

    function preload() {
      // Create simple colored rectangles as sprites
      this.add.graphics()
        .fillStyle(0x00ff00)
        .fillRect(0, 0, 40, 20)
        .generateTexture('player', 40, 20);

      this.add.graphics()
        .fillStyle(0xff0000)
        .fillRect(0, 0, 30, 20)
        .generateTexture('alien', 30, 20);

      this.add.graphics()
        .fillStyle(0xffff00)
        .fillRect(0, 0, 4, 10)
        .generateTexture('bullet', 4, 10);

      this.add.graphics()
        .fillStyle(0xff00ff)
        .fillRect(0, 0, 4, 10)
        .generateTexture('alienBullet', 4, 10);
    }

    function create() {
      // Create player
      player = this.physics.add.sprite(400, 550, 'player');
      player.setCollideWorldBounds(true);

      // Create alien grid
      aliens = this.physics.add.group();
      createAlienGrid.call(this);

      // Create bullet groups
      bullets = this.physics.add.group();
      alienBullets = this.physics.add.group();

      // Input
      cursors = this.input.keyboard.createCursorKeys();
      spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      // UI
      scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial'
      });

      livesText = this.add.text(16, 56, 'Lives: 3', {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial'
      });

      // Collisions
      this.physics.add.overlap(bullets, aliens, hitAlien, null, this);
      this.physics.add.overlap(alienBullets, player, hitPlayer, null, this);
      this.physics.add.overlap(aliens, player, hitPlayer, null, this);

      // Boundaries
      this.physics.add.collider(bullets, this.physics.world.bounds, function(bullet) {
        bullet.destroy();
      });
      this.physics.add.collider(alienBullets, this.physics.world.bounds, function(bullet) {
        bullet.destroy();
      });
    }

    function createAlienGrid() {
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 10; x++) {
          let alien = aliens.create(x * 60 + 100, y * 50 + 50, 'alien');
          alien.setVelocityX(alienSpeed * alienDirection);
        }
      }
    }

    function update() {
      if (gameOver) return;

      // Player movement
      if (cursors.left.isDown) {
        player.setVelocityX(-300);
      } else if (cursors.right.isDown) {
        player.setVelocityX(300);
      } else {
        player.setVelocityX(0);
      }

      // Player shooting
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        shoot.call(this);
      }

      // Alien movement
      moveAliens.call(this);

      // Alien shooting
      if (this.time.now > lastAlienShot + 1000) {
        alienShoot.call(this);
        lastAlienShot = this.time.now;
      }

      // Check win condition
      if (aliens.children.size === 0) {
        nextWave.call(this);
      }

      // Check lose condition
      let bottomAlien = null;
      aliens.children.entries.forEach(alien => {
        if (!bottomAlien || alien.y > bottomAlien.y) {
          bottomAlien = alien;
        }
      });

      if (bottomAlien && bottomAlien.y > 500) {
        endGame.call(this);
      }
    }

    function shoot() {
      let bullet = bullets.create(player.x, player.y - 20, 'bullet');
      bullet.setVelocityY(-400);
    }

    function alienShoot() {
      if (aliens.children.size === 0) return;
      
      let randomAlien = Phaser.Utils.Array.GetRandom(aliens.children.entries);
      let bullet = alienBullets.create(randomAlien.x, randomAlien.y + 20, 'alienBullet');
      bullet.setVelocityY(200);
    }

    function moveAliens() {
      let hitBounds = false;
      
      aliens.children.entries.forEach(alien => {
        if (alien.x <= 30 || alien.x >= 770) {
          hitBounds = true;
        }
      });

      if (hitBounds) {
        alienDirection *= -1;
        aliens.children.entries.forEach(alien => {
          alien.setVelocityX(alienSpeed * alienDirection);
          alien.y += alienDropDistance;
        });
        alienSpeed += 10; // Increase speed each time they hit bounds
      }
    }

    function hitAlien(bullet, alien) {
      bullet.destroy();
      alien.destroy();
      score += 10;
      scoreText.setText('Score: ' + score);
      setGameScore(score);
    }

    function hitPlayer(alienBullet, player) {
      if (alienBullet) alienBullet.destroy();
      
      lives--;
      livesText.setText('Lives: ' + lives);
      
      if (lives <= 0) {
        endGame.call(this);
      } else {
        // Player respawn effect
        player.setTint(0xff0000);
        this.time.delayedCall(1000, () => {
          player.clearTint();
        });
      }
    }

    function nextWave() {
      score += 100; // Bonus for clearing wave
      scoreText.setText('Score: ' + score);
      setGameScore(score);
      
      // Create new wave
      createAlienGrid.call(this);
      alienSpeed += 20; // Increase speed for next wave
    }

    async function endGame() {
      gameOver = true;
      
      // Stop all physics
      this.physics.pause();
      
      // Show game over text
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.add.text(400, 360, 'Final Score: ' + score, {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // Save score to Irys
      if (walletAddress && score > 0) {
        try {
          this.add.text(400, 420, 'Saving score to Irys...', {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial'
          }).setOrigin(0.5);

          await uploadScore(score);
          
          toast({
            title: "Score Saved!",
            description: `Your score of ${score} has been saved to the Irys blockchain`,
          });
        } catch (error) {
          console.error("Error saving score:", error);
          toast({
            title: "Error Saving Score",
            description: error.message,
            variant: "destructive",
          });
        }
      }

      // Delay before calling onGameOver
      this.time.delayedCall(2000, () => {
        onGameOver(score);
      });
    }

    // Create and start the game
    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    // Cleanup function
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [onGameOver, uploadScore, walletAddress, toast]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Current Score: {gameScore}</h3>
        <p className="text-gray-400 text-sm">
          Use ← → arrows to move, SPACE to shoot
        </p>
      </div>
      <div 
        ref={gameRef}
        className="border-2 border-purple-500/30 rounded-lg overflow-hidden shadow-2xl"
        style={{ width: '800px', height: '600px' }}
      />
    </div>
  );
};

export default GameCanvas;