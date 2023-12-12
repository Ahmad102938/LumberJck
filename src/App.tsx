import 'phaser';
import branch from './assets/wood4.png';
import bg from './assets/bg2.jpg';
import jack from './assets/lumberjack3.png';
import twig from './assets/sidebranch5.png';
import grey_button from './assets/grey_button.png';
import red_button from './assets/red_button.png';
import yellow_pannel from './assets/yellow_panel.png';

import bgm from './assets/bgm.ogg';
import impact from './assets/impact.wav';

export const gameSceneKey = 'GameScene';

export function game(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
    let startKey: Phaser.Input.Keyboard.Key;

    var arraybranch: any[] = []; 
    var arrayresumebranch: any[] = [];
    var score:any = 0;
    var indicatortimer: Phaser.GameObjects.Image | null = null;
    var timecountdown = 10000;
    var reducetime = 1;
    var gameover = false;

    const right_player_position = 1;
    const left_player_position = 2;
    const max_dis_width = 150;
    const max_time_count = 10000;
    const add_timer = 200;
    const min_reduce_time = 0.3;

    return {
      key: gameSceneKey,
      preload() {
        startKey = (this as any).input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.S,
        );
        startKey.isDown = false;
        this.load.image('bg', bg);
        this.load.image('branch', branch);
        this.load.image('jack', jack);
        this.load.image('twig', twig);
        this.load.image('grey', grey_button);
        this.load.image('red', red_button);
        this.load.image('yellow_pannel', yellow_pannel);

        this.load.audio('bgm', bgm);
        this.load.audio('impact', impact );
      },
      create() {
        (this as any).addbranch = function(){
            var container = this.add.container(0,0);
            container.setDataEnabled();
            var branch = this.add.image(0, 0, 'branch');
            var righttwig = this.add.image(70,0,'twig');
            var lefttwig = this.add.image(-70,0,'twig')
            lefttwig.setFlip(true, false);

            container.add(branch);
            container.add(righttwig);
            container.add(lefttwig);

            return container;

        };

        (this as any).fillbranch = function(elimtwig: number | undefined){
            if(elimtwig == undefined) elimtwig =2;
            var newbranch = null
            if(arrayresumebranch.length>0){
                newbranch = arrayresumebranch[0];
                arrayresumebranch.shift();
                newbranch.iterate((child: { visible: boolean; })=>{
                    child.visible = true;
                });
            }
            else{
               newbranch = this.addbranch();
            }

            if(elimtwig == 0){
                var righttwig = newbranch.getAt(1);
                righttwig.visible = false;
                var lefttwig = newbranch.getAt(2);
                lefttwig.visible = false;
                newbranch.data.set("twig", 0);
            }else if(elimtwig == 1){
                var righttwig = newbranch.getAt(1);
                righttwig.visible = false;
                newbranch.data.set("twig", 1);
            }else if(elimtwig == 2){
                var lefttwig = newbranch.getAt(2);
                lefttwig.visible = false;
                newbranch.data.set("twig", 2);
            }

            return newbranch;
        };

        (this as any).animtnbranch = function(branch: any, position: any ) {

            var timeline = this.add.timeline([
                {
                    tween: {
                        targets:branch,
                        ease: "linear",
                        duration: 300,
                        y: 500,
                    }
                    
                },

                {
                    tween: {
                        targets:branch,
                        ease: "linear",
                        duration: 300,
                        y: 700,
                        onComplete:function(){
                            arrayresumebranch.push(branch);
                        },
                    }
                }
            ]);

            timeline.play();

            var x_roll = 360;
            if(position== "left"){
                x_roll=120;
            }
            
            this.tweens.add({
                targets:branch,
                ease: "linear",
                duration: 600,
                x: x_roll,
                angle: 720,
            });
        };

        (this as any).chkcollsn = function(playerposition: any){
          var collision = false;
          var branch = arraybranch[0];
          var branchposition = branch.data.get("twig");
          if(branchposition == playerposition){
              (this as any).losegame();
              collision = true;
              
          }
          return (collision as boolean);
      };

      (this as any).losegame = function(){
        console.log("yss");
        gameover = true;
        (this as any).input.keyboard.enabled = false;
        this.add.image(400, 300, 'yellow_pannel').setScale(3);
        this.add.text(400, 300, "GAME-OVER", {
            fontSize:30,
            color:"#000",
            align:"center"
        }).setOrigin(0.5);
    };
        
        (this as any).lowerbranch = function(){
            for(var i=0; i<arraybranch.length; i++){
                var branch = arraybranch[i];
                branch.y = 600 - (i+1)*105;

            };
            
            var randomtwig = Phaser.Math.Between(1,2);
            var topbranch = arraybranch[arraybranch.length - 1];
            var twigdata = topbranch.data.get("twig");
            if(twigdata>0){
                randomtwig = 0;
            }

            var newbranch = this.fillbranch(randomtwig);

            newbranch.setPosition(topbranch.x, topbranch.y - 105);
            
            newbranch.angle = 0;
            arraybranch.push(newbranch);

        }



        this.sound.add("bgm").play({loop:true});
        this.add.image(400, 300, 'bg');

        this.add.image(100, 40, 'grey').setScale(0.8);
        indicatortimer = this.add.image(25, 40, 'red').setOrigin(0,0.5).setScale(0.6);
        indicatortimer.displayWidth = max_dis_width;

        (this as any).textscore = this.add.text(600, 50, score, {color:"#000", fontSize:50, align:"center"}).setOrigin(0.5).setDepth(1);

        var jack = this.add.image(300,550,'jack');

        for(var i=1;i<=10;i++){
            var branch = (this as any).addbranch();

            if(i%2==0 || i==1){
                var righttwig = branch.getAt(1);
                righttwig.visible = false;
                var lefttwig = branch.getAt(2);
                lefttwig.visible = false;
                branch.data.set("twig", 0);
            }else{
                var random = Phaser.Math.Between(1,2);
                var twig = branch.getAt(random);
                twig.visible = false;
                branch.data.set("twig", random);
            }

            branch.setPosition(400, 600 - i*105,);
            arraybranch.push(branch);
        }

        this.input.keyboard?.on('keydown-RIGHT', ()=>{
            if (gameover) return;
            jack.x=480;
            jack.flipX = true;
            var branch = arraybranch[0];
            if((this as any).animtnbranch(branch, "left")) return;
            (this as any).chkcollsn(left_player_position);
            arraybranch.shift();
            (this as any).lowerbranch();
            if((this as any).chkcollsn(left_player_position)) return;
            score+=1;
            (this as any).textscore.text = score;
            timecountdown += add_timer*reducetime;
            if(timecountdown>max_time_count) timecountdown=max_time_count;
            this.sound.add("impact").play();
        });

        this.input.keyboard?.on('keydown-LEFT', ()=>{
            if (gameover) return;
            jack.x=300;
            jack.flipX = false;
            var branch = arraybranch[0];
            if((this as any).animtnbranch(branch, "right")) return;
            (this as any).chkcollsn(right_player_position);
            arraybranch.shift();
            (this as any).lowerbranch();
            if((this as any).chkcollsn(right_player_position)) return;
            score+=1;
            (this as any).textscore.text = score;
            timecountdown += add_timer*reducetime;
            if(timecountdown>max_time_count) timecountdown=max_time_count;
            this.sound.add('impact').play();
        })

        
      },
      update(_time, dt) {
        if (startKey.isDown) {
        
          this.scene.start(gameSceneKey);
        }
        if(gameover) return;
        timecountdown -= dt;
        if(timecountdown<=0) {
            timecountdown=0;
            gameover = true;
            this.add.image(400, 300, 'yellow_pannel').setScale(3);
            this.add.text(400, 300, "GAME-OVER", {
                fontSize:30,
                color:"#000",
                align:"center"
            }).setOrigin(0.5);
        };
        reducetime -= dt*0.0001;
        if(reducetime<min_reduce_time) reducetime = min_reduce_time;
        (indicatortimer as any).displayWidth = max_dis_width*(timecountdown/max_time_count);
    
        // for (let i = 0; i < sprites.length; i++) {
        //     const sprite = sprites[i].s;
    
        //     sprite.y -= sprites[i].r;
    
        //     if (sprite.y < -256)
        //     {
        //         sprite.y = 700;
        //     }
        // }
      },
    }
  }
