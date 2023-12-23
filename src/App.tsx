import 'phaser';
import branch from './assets/wood4.png';
import bg from './assets/bg2.jpg';
import jack from './assets/lumberjack3.png';
import twig from './assets/sidebranch5.png';
import grey_button from './assets/grey_button1.png';
import red_button from './assets/red_button1.png';
import yellow_pannel from './assets/yellow_panel.png';
import restart from './assets/restart.png';

import bgm from './assets/bgm.ogg';
import impact from './assets/impact.wav';


export const gameSceneKey = 'GameScene';


export function game(): Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig {
    let StartKey: Phaser.Input.Keyboard.Key;

    let Jack: Phaser.GameObjects.Image;
    let restartButton: Phaser.GameObjects.Image;

    let ArrayBranch: any[] = []; 
    let ArrayResumeBranch: any[] = [];
    let Score:any = 0;
    let IndicatorTimer: Phaser.GameObjects.Image | null = null;
    let TimeCountDown = 10000;
    let ReduceTime = 1;
    let MaxDisWidth = 115;

    let GameOver = false;
    let leftButtonDown: boolean = false;
    let rightButtonDown: boolean = false;
    let touchActionTriggered: boolean = false;

    const RIGHT_PLAYER_POSITION = 1;
    const LEFT_PLAYER_POSITION = 2;
    const MAX_TIME_COUNT = 10000;
    const ADD_TIMER = 200;
    const MIN_REDUCE_TIME = 0.3;

    return {
      key: gameSceneKey,
      preload() {
        StartKey = (this as any).input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.S,
        );
        StartKey.isDown = false;
        (this as any).load.image('bg', bg);
        (this as any).load.image('branch', branch);
        (this as any).load.image('jack', jack);
        (this as any).load.image('twig', twig);
        (this as any).load.image('grey', grey_button);
        (this as any).load.image('red', red_button);
        (this as any).load.image('yellow_pannel', yellow_pannel);
        (this as any).load.image('restart', restart);

        (this as any).load.audio('bgm', bgm);
        (this as any).load.audio('impact', impact );

        (this as any).canvas = (this as any).sys.game.canvas;
      },
      create() {
        (this as any).addbranch = function(){
            let Container = this.add.container(0,0);
            Container.setDataEnabled();
            let Branch = this.add.image(0, 0, 'branch');
            let RightTwig = this.add.image(70,0,'twig');
            let LeftTwig = this.add.image(-70,0,'twig')
            LeftTwig.setFlip(true, false);

            Container.add(Branch);
            Container.add(RightTwig);
            Container.add(LeftTwig);

            return Container;

        };


        (this as any).fillbranch = function(elimtwig: number | undefined){
            if(elimtwig == undefined) elimtwig =2;
            let NewBranch = null
            if(ArrayResumeBranch.length>0){
                NewBranch = ArrayResumeBranch[0];
                ArrayResumeBranch.shift();
                NewBranch.iterate((child: { visible: boolean; })=>{
                    child.visible = true;
                });
            }
            else{
               NewBranch = this.addbranch();
            }

            if(elimtwig == 0){
                let RightTwig = NewBranch.getAt(1);
                RightTwig.visible = false;
                let LeftTwig = NewBranch.getAt(2);
                LeftTwig.visible = false;
                NewBranch.data.set("twig", 0);
            }else if(elimtwig == 1){
                let RightTwig = NewBranch.getAt(1);
                RightTwig.visible = false;
                NewBranch.data.set("twig", 1);
            }else if(elimtwig == 2){
                let LeftTwig = NewBranch.getAt(2);
                LeftTwig.visible = false;
                NewBranch.data.set("twig", 2);
            }


            return NewBranch;
        };

        (this as any).animtnbranch = function(branch: any, position: any ) {

            var TimeLine = this.tweens.createTimeline();
            TimeLine.add({
                targets: branch,
                ease: "Linear",
                duration: 300,
                y: (this as any).canvas.height-105,
            });
            TimeLine.add({
                targets: branch,
                ease: "Linear",
                duration: 300,
                y: (this as any).canvas.height+105,
                onComplete: function() {
                    ArrayResumeBranch.push(branch);
                },
            });
    

            TimeLine.play();

            let x_roll = (this as any).canvas.width*0.75;
            if(position== "left"){
                x_roll=(this as any).canvas.width*0.25;
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
          let Collision = false;
          let Branch = ArrayBranch[0];
          let BranchPosition = Branch.data.get("twig");
          if(BranchPosition == playerposition){
              (this as any).losegame();
              Collision = true;
              
          }
          return (Collision as boolean);
      };

      (this as any).losegame = function(){
        console.log("yss");
        GameOver = true;
        (this as any).input.keyboard.enabled = false;
        this.add.image(this.canvas.width*0.5, this.canvas.height*0.5, 'yellow_pannel').setScale(3);
        this.add.text(this.canvas.width*0.5, this.canvas.height*0.5, "GAME-OVER", {
            fontSize:30,
            color:"#000",
            align:"center"
        }).setOrigin(0.5);
    };
        
        (this as any).lowerbranch = function(){
            for(let i=0; i<ArrayBranch.length; i++){
                let Branch = ArrayBranch[i];
                Branch.y = this.canvas.height - (i+1)*105;

            };
            
            let RandomTwig = Phaser.Math.Between(1,2);
            let TopBranch = ArrayBranch[ArrayBranch.length - 1];
            let TwigData = TopBranch.data.get("twig");
            if(TwigData>0){
                RandomTwig = 0;
            }

            let NewBranch = this.fillbranch(RandomTwig);

            NewBranch.setPosition(TopBranch.x, TopBranch.y - 105);
            
            NewBranch.angle = 0;
            ArrayBranch.push(NewBranch);
            console.log(this.canvas.height);

        }

        //Sound
        let Sound = (this as any).sound.add("bgm");
        Sound.play({loop:true});

        //Background Image
        (this as any).add.image((this as any).canvas.width*0.5, (this as any).canvas.height*0.5, 'bg');

        //Displaying Text Score
        (this as any).textscore = (this as any).add.text((this as any).canvas.width*0.8, 50, Score, {color:"#000", fontSize:50, align:"center"}).setOrigin(0.5).setDepth(1);

        //Adding Life Of The Game
        (this as any).add.image(65, 40, 'grey').setScale(0.8).setDepth(2);
        IndicatorTimer = (this as any).add.image(6, 40, 'red').setOrigin(0,0.5).setScale(0.6).setDepth(2);
        (IndicatorTimer as any).displayWidth = MaxDisWidth;

        

        //Player (Jack)
        Jack = (this as any).add.image((this as any).canvas.width*0.5-105,(this as any).canvas.height-60,'jack');

        //Restart
        restartButton = (this as any).add.image((this as any).canvas.width * 0.5, (this as any).canvas.height * 0.6, 'restart').setDepth(2)
                .setScale(2)
                .setInteractive();

        restartButton.on('pointerup', () => {
                Jack.destroy();
                Sound.stop();
                Score = 0;
                MaxDisWidth = 115;
                TimeCountDown = MAX_TIME_COUNT;
                ReduceTime = 1;
                ArrayBranch = [];
                ArrayResumeBranch = [];
                // Restart the game when the button is clicked
                (this as any).scene.stop(); // Stop the current scene
                (this as any).scene.start(gameSceneKey);
                GameOver = false;
                (this as any).input.keyboard.enabled = true;
        });

        //Function Of Creating Branch With Visible And Invisisble Twigs
        for(let i=1;i<=11;i++){
            let Branch = (this as any).addbranch();

            if(i%2==0 || i==1){
                let RightTwig = Branch.getAt(1);
                RightTwig.visible = false;
                let LeftTwig = Branch.getAt(2);
                LeftTwig.visible = false;
                Branch.data.set("twig", 0);
            }else{
                let Random = Phaser.Math.Between(1,2);
                let Twig = Branch.getAt(Random);
                Twig.visible = false;
                Branch.data.set("twig", Random);
            }

            Branch.setPosition((this as any).canvas.width*0.5, (this as any).canvas.height - i*105,);
            ArrayBranch.push(Branch);
        }

         // Add touch controls
         (this as any).input.on('pointerdown', (pointer: any) => {
            const { x } = pointer;

            // Check if touch is on the left side of the screen
            if (x < (this as any).canvas.width / 2) {
                leftButtonDown = true;
                rightButtonDown = false;
            }
            // Check if touch is on the right side of the screen
            else {
                leftButtonDown = false;
                rightButtonDown = true;
            }

            // Reset the touch action flag
            touchActionTriggered = false;
        });

        (this as any).input.on('pointerup', () => {
            leftButtonDown = false;
            rightButtonDown = false;
            touchActionTriggered = false;
        });

        (this as any).input.keyboard?.on('keydown-RIGHT', ()=>{
            if (GameOver) {
                restartButton.visible = true; // Make the restart button visible
                return;
            } else {
                restartButton.visible = false; // Hide the restart button during gameplay
            }
            Jack.x=(this as any).canvas.width*0.5+105;
            Jack.flipX = true;
            let Branch = ArrayBranch[0];
            if((this as any).animtnbranch(Branch, "left")) return;
            (this as any).chkcollsn(LEFT_PLAYER_POSITION);
            ArrayBranch.shift();
            (this as any).lowerbranch();
            if((this as any).chkcollsn(LEFT_PLAYER_POSITION)) return;
            Score+=1;
            (this as any).textscore.text = Score;
            TimeCountDown += ADD_TIMER*ReduceTime;
            if(TimeCountDown>MAX_TIME_COUNT) TimeCountDown=MAX_TIME_COUNT;
            (this as any).sound.add("impact").play();
        });

        (this as any).input.keyboard?.on('keydown-LEFT', ()=>{
            if (GameOver) {
                restartButton.visible = true; // Make the restart button visible
                return;
            } else {
                restartButton.visible = false; // Hide the restart button during gameplay
            }
            Jack.x=(this as any).canvas.width*0.5-105;
            Jack.flipX = false;
            let Branch = ArrayBranch[0];
            if((this as any).animtnbranch(Branch, "right")) return;
            (this as any).chkcollsn(RIGHT_PLAYER_POSITION);
            ArrayBranch.shift();
            (this as any).lowerbranch();
            if((this as any).chkcollsn(RIGHT_PLAYER_POSITION)) return;
            Score+=1;
            (this as any).textscore.text = Score;
            TimeCountDown += ADD_TIMER*ReduceTime;
            if(TimeCountDown>MAX_TIME_COUNT) TimeCountDown=MAX_TIME_COUNT;
            (this as any).sound.add('impact').play();
        })



        
      },
      update(_time: any, dt: number) {

        
        if (StartKey.isDown) {
        
            (this as any).scene.start(gameSceneKey);
        }
      
         // Check for touch controls
         if (leftButtonDown && !touchActionTriggered) {
            // Handle left movement
            if (GameOver) {
                restartButton.visible = true; // Make the restart button visible
                return;
            } else {
                restartButton.visible = false; // Hide the restart button during gameplay
            }
            Jack.x=(this as any).canvas.width*0.5-105;
            Jack.flipX = false;
            let Branch = ArrayBranch[0];
            if((this as any).animtnbranch(Branch, "right")) return;
            (this as any).chkcollsn(RIGHT_PLAYER_POSITION);
            ArrayBranch.shift();
            (this as any).lowerbranch();
            if((this as any).chkcollsn(RIGHT_PLAYER_POSITION)) return;
            Score+=1;
            (this as any).textscore.text = Score;
            TimeCountDown += ADD_TIMER*ReduceTime;
            if(TimeCountDown>MAX_TIME_COUNT) TimeCountDown=MAX_TIME_COUNT;
            (this as any).sound.add('impact').play();
            touchActionTriggered = true;
        } else if (rightButtonDown && !touchActionTriggered) {
            // Handle right movement
            if (GameOver) {
                restartButton.visible = true; // Make the restart button visible
                return;
            } else {
                restartButton.visible = false; // Hide the restart button during gameplay
            }
            Jack.x=(this as any).canvas.width*0.5+105;
            Jack.flipX = true;
            let Branch = ArrayBranch[0];
            if((this as any).animtnbranch(Branch, "left")) return;
            (this as any).chkcollsn(LEFT_PLAYER_POSITION);
            ArrayBranch.shift();
            (this as any).lowerbranch();
            if((this as any).chkcollsn(LEFT_PLAYER_POSITION)) return;
            Score+=1;
            (this as any).textscore.text = Score;
            TimeCountDown += ADD_TIMER*ReduceTime;
            if(TimeCountDown>MAX_TIME_COUNT) TimeCountDown=MAX_TIME_COUNT;
            (this as any).sound.add("impact").play();
            touchActionTriggered = true;
        }

        // if(GameOver) return;
        if(GameOver){
            restartButton.visible = true;
            return;
        } else{
            restartButton.visible = false;
        }
        TimeCountDown -= dt;
        if(TimeCountDown<=0) {
            TimeCountDown=0;
            GameOver = true;
            let YellowPannel = (this as any).add.image((this as any).canvas.width*0.5, (this as any).canvas.height*0.5, 'yellow_pannel').setOrigin(0.5);
            YellowPannel.setScale((this as any).canvas.width / YellowPannel.width, (this as any).canvas.height / YellowPannel.height);
            (this as any).add.text((this as any).canvas.width*0.5, (this as any).canvas.height*0.5, "GAME-OVER", {
                fontSize:30,
                color:"#000",
                align:"center"
            }).setOrigin(0.5);
        };
        ReduceTime -= dt*0.0001;
        if(ReduceTime<MIN_REDUCE_TIME) ReduceTime = MIN_REDUCE_TIME;
        (IndicatorTimer as any).displayWidth = MaxDisWidth*(TimeCountDown/MAX_TIME_COUNT);
    
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
