let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas"
}

PIXI.utils.sayHello(type)

var heightWindow = window.innerHeight;
var widthWindow = window.innerWidth;
if(widthWindow>700){
    widthWindow=700;
}
var width = 700;
var height = 1080; 
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Graphics = PIXI.Graphics,
    Container = PIXI.Container;
    renderer = PIXI.autoDetectRenderer(width, heightWindow);
let util = new SpriteUtilities(PIXI);

let game;
let principal;
let enemigos = []; 
let velocidaEstandarEnemigo = 1;
let velocidadEnemigo = 1;
let velocidadPrincipal = 4; 
let Background;
let Chars;
let Fondo;
let Laterales = 137;
let PosicionFinalAncho = renderer.width - (Laterales + 40);
let PosicionFinal;
let consecutivoEnemigos = 0;
let activeVelocidad = false;
let totalPasaChars = 0;
let nivel = 0;
let puntos = 0;
let puntoAdicional = 0;
// Sounds
let SoundMenu;
let SoundDeath;
let SoundPrincipal;
// 
let Content;
let volumenVelocidad=0;
let pasaVolumen=0;


loader.add("pista", "assets/img/cave.png")
    .add("chars", "assets/img/characters.png")
    .add("SoundMenu", "assets/sound/Menu.mp3")
    .add("SoundMain", "assets/sound/Main.mp3")
    .add("SoundDeath", "assets/sound/Death.mp3");
loader.load();
loader.onError.add((e, d) => {
    console.log(e, d);
});
loader.onLoad.add((_e, p) => {
    console.log(p.progressChunk);
});

loader.onComplete.add((_loader, resources) => {
    Background = resources["pista"].texture;
    Chars = resources["chars"].texture;    
    SoundMenu = resources["SoundMenu"].sound;
    SoundMenu.volume = 0.5;
    SoundMenu.loop = 1;
    SoundMenu.play();
    SoundPrincipal = resources["SoundMain"].sound;
    SoundPrincipal.loop = 1;
    SoundPrincipal.speed = 0.3;
    SoundDeath = resources["SoundDeath"].sound;
})


function init(){
    SoundMenu.pause();
    enemigos = []; 
    velocidaEstandarEnemigo = 1;
    velocidadEnemigo = 1;
    velocidadPrincipal = 4;
    consecutivoEnemigos = 0;
    activeVelocidad = false;
    totalPasaChars = 0;
    nivel = 0;
    puntos = 0;
    puntoAdicional = 0;
    volumenVelocidad = 0;
    pasaVolumen = 0;

    game = new Application({ width: width, height: heightWindow });
    game.renderer.backgroundColor = 0x061639;
    game.renderer.autoRezise = true;
    document.getElementById("juego").appendChild(game.view);
    setup();
}

function setup(delta) {
    Content = new Container();
    Fondo = util.tilingSprite(Background, width, height, 0, 0);
    Fondo.tileY = 0;
    Content.addChild(Fondo);

    principal = jugador();
    Content.addChild(principal);

    let left = keyboard("ArrowLeft"),
        right = keyboard("ArrowRight");
    down = keyboard("ArrowDown");
    left.press = () => {
        fleleft()
    }
    left.release = () => {
        fleleftOut()
    }
    right.press = () => {
        fleRight();
    }
    right.release = () => {
        fleRightOut();
    }
    down.press = () => {
        fleDown();        
    }
    down.release = () => {
        fleDownOut();        
    }
    state = play;
    SoundPrincipal.play();
    
    Content.scale.x = widthWindow/Background.width;
    Content.scale.y = heightWindow/Background.height;
  

    game.stage.addChild(Content);

    game.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) { 
    Content.addChild(boots()); 
    for (let index = 1; index < enemigos.length; index++) {
        enemigos[index].vy = enemigos[index].vy + velocidadEnemigo;
        enemigos[index].y = enemigos[index].vy;
        if(enemigos[index].y > heightWindow && !enemigos[index].paso){
            enemigos[index].paso = true;
            totalPasaChars++; 
            puntos += (5 + puntoAdicional);
            document.querySelector(".puntos").innerHTML = puntos;
            if(totalPasaChars==20){
                nivel++;                
                document.querySelector(".nivel").innerHTML = nivel;
                velocidaEstandarEnemigo += 0.5;
                totalPasaChars=0;
            }
        }
    }
    Fondo.tileY -= 0.5 * velocidadEnemigo;
    state(delta);
}

function play(delta) {
    if (principal.x >= Laterales && principal.x <= PosicionFinalAncho) {
        principal.x += principal.vx;
        principal.y += principal.vy;
    } else {
        principal.x = PosicionFinal;
    }        
    if((nivel%5)==0 && nivel>0 && nivel!=pasaVolumen){
        pasaVolumen=nivel;
        volumenVelocidad = volumenVelocidad + 0.1;
        if(volumenVelocidad>=1){
            volumenVelocidad = 0.9;
        }
    }
    if(activeVelocidad){
        puntoAdicional = 20;
        velocidadEnemigo = velocidaEstandarEnemigo + 10; 
        SoundPrincipal.speed = volumenVelocidad + 0.1;
    } else{
        puntoAdicional = 0;
        velocidadEnemigo = velocidaEstandarEnemigo; 
        SoundPrincipal.speed = volumenVelocidad;
    }


    for (let index = 1; index < enemigos.length; index++) {
        if (hitTestRectangle(enemigos[index], principal)) {
            gameOver();
        }
        else {

        }
    }
}


function iniciaGame(){
    document.querySelector(".puntos").innerHTML = 0;
    document.querySelector(".nivel").innerHTML = 0;
    document.querySelector(".pantalla").classList.add("active");
    document.querySelector(".flechas").classList.add("active");
    init();
}

function gameOver(){ 
    SoundPrincipal.stop();    
    SoundDeath.play();
    game.stop();    
    document.querySelector(".pantalla").classList.remove("active");
    document.querySelector(".flechas").classList.remove("active");
    document.querySelector(".pantalla h1").innerHTML = "Try again";
    setTimeout(() => {
        SoundMenu.play();
        document.querySelector("canvas").remove();
    }, 1000);
}
