//this is a template to add a NEAT ai to any game
//note //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
//this means that there is some information specific to the game to input here
let b2Vec2 = Box2D.Common.Math.b2Vec2;
let b2BodyDef = Box2D.Dynamics.b2BodyDef;
let b2Body = Box2D.Dynamics.b2Body;
let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
let b2Fixture = Box2D.Dynamics.b2Fixture;
let b2World = Box2D.Dynamics.b2World;
let b2MassData = Box2D.Collision.Shapes.b2MassData;
let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
let b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;

let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
let b2StaticBody = Box2D.Dynamics.b2Body.b2_staticBody;
let b2DynamicBody = Box2D.Dynamics.b2Body.b2_dynamicBody;
let b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;
let b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

let b2PrismaticJoint = Box2D.Dynamics.Joints.b2PrismaticJoint;
let b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;

let b2FilterData = Box2D.Dynamics.b2FilterData;

let b2DistanceJoint = Box2D.Dynamics.Joints.b2DistanceJoint;
let b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;

let b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
let b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;

var SCALE = 30

var nextConnectionNo = 1000;
var population;
var speed = 60;


var showBest = false; //true if only show the best of the previous generation
var runBest = false; //true if replaying the best ever game
var humanPlaying = false; //true if the user is playing

var humanPlayer;


var showBrain = true;
var showBestEachGen = false;
var upToGen = 0;
var genPlayerTemp; //player

var showNothing = false;
let offset
let easing = 0.05
let terrain = []

function getBest(){
  var best = 0
  var best_player = 0
  for (var i=0;i<population.players.length;i++){
    if (population.players[i].fitness > best && !population.players[i].dead){
      best = population.players[i].fitness
      best_player = i
    }
  }
  return best_player
}

function makeTerrain(){
  var terrain = []
  var vectors = [];
  var dirtBody;
  var grassBody;

  var distance = 15 * canvas.width;
  var x = 0;
  var y = 0;
  var smoothness = 50; //a vector every
  var grassThickness = 5;
  var steepness = 250;

  var grassPositions = [];
  var steepnessLevel = 200; //from 0 to 200
  var estimatedDIfficulty = 0;
  let startingPoint = random(100000);

      let totalDifference = 0;
      for (var i = 0; i < distance; i += smoothness) {

        steepnessLevel = map(i, 0, distance, 130, 250);
        // this.steepnessLevel = map(i, 0, this.distance, 200, 200);

        let flatLength = 200;
        let noisedY = noise(startingPoint + (i - flatLength) / (700 - steepnessLevel));
        let maxHeight = 300 + map(steepnessLevel, 0, 200, 0, 350);
        let minHeight = 30;
        let heightAddition = 0;
        if (i < flatLength) {
          noisedY = noise(startingPoint);
          heightAddition = (flatLength - i) / 7;
        }

        vectors.push(new b2Vec2(i, canvas.height - map(noisedY, 0, 1, minHeight, maxHeight) + heightAddition));
        if (i > 0) {
          totalDifference += abs(vectors[vectors.length - 2].y - vectors[vectors.length - 1].y);
        }

        //add grass


      }
      console.log(totalDifference);

      vectors.push(new b2Vec2(distance, canvas.height + grassThickness * 2));
      vectors.push(new b2Vec2(0, canvas.height + grassThickness * 2));

      for (var vect of vectors) {
        vect.x /= SCALE;
        vect.y /= SCALE;
      }

      return vectors
}



function makeBox(world, bodyType, x, y, w, h, density, friction, res, mass, isSens) {
  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction
  fixDef.restitution = res
  fixDef.isSensor = isSens
  // fixDef.mass = mass
  let bodyDef = new b2BodyDef()
  bodyDef.type = bodyType
  bodyDef.position.x = x / SCALE
  bodyDef.position.y = y / SCALE
  fixDef.shape = new b2PolygonShape()
  fixDef.shape.SetAsBox(w / SCALE, h / SCALE)
  var filtData = new b2FilterData();
    // filtData.groupIndex = -1;



  let body = world.CreateBody(bodyDef)
  body.CreateFixture(fixDef)
  return body
}

function makeCircle(world, bodyType, x, y, r, density, friction, res, mass, isSens) {




  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction
  fixDef.restitution = res


  let circle = new b2CircleShape()
  circle.m_radius = r/SCALE

  let bodyDef = new b2BodyDef()
  bodyDef.type = bodyType
  bodyDef.position.x = x / SCALE
  bodyDef.position.y = y / SCALE
  fixDef.shape = circle








  let body = world.CreateBody(bodyDef)
  body.CreateFixture(fixDef)
  return body
}


function makePoly(world, bodyType, vertices, x, y, density, friction, res, mass){
  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction
  fixDef.restitution = res

  // fixDef.mass = mass
  let bodyDef = new b2BodyDef()
  bodyDef.type = bodyType

  fixDef.shape = new b2PolygonShape()
  fixDef.shape.SetAsArray(vertices, vertices.length)
  var filtData = new b2FilterData();
    // filtData.groupIndex = -1;



  let body = world.CreateBody(bodyDef)
  body.CreateFixture(fixDef)
  return body
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function setup() {
  window.canvas = createCanvas(1280, 720);
  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  offset = createVector(0, 0)
  terrain = makeTerrain()
  population = new Population(50);
  humanPlayer = new Player();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function draw() {
  background(56)

  drawToScreen();
  beginShape()
  for (var i=0;i<terrain.length;i++){
    var verts = terrain[i]

    stroke(0)



    vertex((verts.x), (verts.y))


  }

  push()
  noStroke()
  fill(255, 0, 0)

  rect(population.players[getBest()].bodies[1].GetPosition().x, population.players[getBest()].bodies[1].GetPosition().y, population.players[getBest()].bodyScales[1][0]/SCALE, population.players[getBest()].bodyScales[1][1]/SCALE)
  pop()
  for (var i=0;i<terrain.length;i++){
    var verts = terrain[i]

    stroke(0)



    vertex((verts.x*SCALE+offset.x), (verts.y*SCALE))


  }
  endShape()
  if (showBestEachGen) { //show the best of each gen
    showBestPlayersForEachGeneration();
  } else if (humanPlaying) { //if the user is controling the ship[
    showHumanPlaying();
  } else if (runBest) { // if replaying the best ever game
    showBestEverPlayer();
  } else { //if just evolving normally
    if (!population.done()) { //if any players are alive then update them
      let targetX = population.players[getBest()].bodies[1].GetPosition().x*SCALE*-1+500;
      let dx = targetX - offset.x;
      offset.x += dx * easing;





      population.updateAlive();
      push()
      fill(0)
      //translate(population.players[getBest()].bodies[1].oldx+offset.x, population.players[getBest()].bodies[1].GetPosition().y*SCALE)

      pop()
    } else { //all dead
      //genetic algorithm
      population.naturalSelection();
    }
  }
}
//-----------------------------------------------------------------------------------
function showBestPlayersForEachGeneration() {
  if (!genPlayerTemp.dead) { //if current gen player is not dead then update it

    genPlayerTemp.look();
    genPlayerTemp.think();
    genPlayerTemp.update();
    genPlayerTemp.show();
  } else { //if dead move on to the next generation
    upToGen++;
    if (upToGen >= population.genPlayers.length) { //if at the end then return to the start and stop doing it
      upToGen = 0;
      showBestEachGen = false;
    } else { //if not at the end then get the next generation
      genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
    }
  }
}
//-----------------------------------------------------------------------------------
function showHumanPlaying() {
  if (!humanPlayer.dead) { //if the player isnt dead then move and show the player based on input
    humanPlayer.look();
    humanPlayer.update();
    humanPlayer.show();
  } else { //once done return to ai
    humanPlaying = false;
  }
}
//-----------------------------------------------------------------------------------
function showBestEverPlayer() {
  if (!population.bestPlayer.dead) { //if best player is not dead
    population.bestPlayer.look();
    population.bestPlayer.think();
    population.bestPlayer.update();
    population.bestPlayer.show();
  } else { //once dead
    runBest = false; //stop replaying it
    population.bestPlayer = population.bestPlayer.cloneForReplay(); //reset the best player so it can play again
  }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------
//draws the display screen
function drawToScreen() {
  if (!showNothing) {
    //pretty stuff
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    drawBrain();
    writeInfo();
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function drawBrain() { //show the brain of whatever genome is currently showing
  var startX = 50; //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  var startY = 0;
  var w = 300;
  var h = 300;

  if (runBest) {
    population.bestPlayer.brain.drawGenome(startX, startY, w, h);
  } else
  if (humanPlaying) {
    showBrain = false;
  } else if (showBestEachGen) {
    genPlayerTemp.brain.drawGenome(startX, startY, w, h);
  } else {
    population.players[getBest()].brain.drawGenome(startX, startY, w, h);
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//writes info about the current player
function writeInfo() {
  fill(200);
  textAlign(LEFT);
  textSize(30);
  if (showBestEachGen) {
    text("Score: " + genPlayerTemp.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    text("Gen: " + (genPlayerTemp.gen + 1), 1150, 50);
  } else
  if (humanPlaying) {
    text("Score: " + humanPlayer.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  } else
  if (runBest) {
    text("Score: " + population.bestPlayer.score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    text("Gen: " + population.gen, 1150, 50);
  } else {
    if (showBest) {
      text("Score: " + population.players[0].score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      text("Gen: " + population.gen, 1150, 50);
      text("Species: " + population.species.length, 50, canvas.height / 2 + 300);
      text("Global Best Score: " + population.bestScore, 50, canvas.height / 2 + 200);
    }
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function keyPressed() {
  switch (key) {
    case ' ':
      //toggle showBest
      showBest = !showBest;
      break;
      // case '+': //speed up frame rate
      //   speed += 10;
      //   frameRate(speed);
      //   prvarln(speed);
      //   break;
      // case '-': //slow down frame rate
      //   if(speed > 10) {
      //     speed -= 10;
      //     frameRate(speed);
      //     prvarln(speed);
      //   }
      //   break;
    case 'B': //run the best
      runBest = !runBest;
      break;
    case 'G': //show generations
      showBestEachGen = !showBestEachGen;
      upToGen = 0;
      genPlayerTemp = population.genPlayers[upToGen].clone();
      break;
    case 'N': //show absolutely nothing in order to speed up computation
      showNothing = !showNothing;
      break;
    case 'P': //play
      humanPlaying = !humanPlaying;
      humanPlayer = new Player();
      break;
  }
  //any of the arrow keys
  switch (keyCode) {
    case UP_ARROW: //the only time up/ down / left is used is to control the player
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case DOWN_ARROW:
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case LEFT_ARROW:
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      break;
    case RIGHT_ARROW: //right is used to move through the generations

      if (showBestEachGen) { //if showing the best player each generation then move on to the next generation
        upToGen++;
        if (upToGen >= population.genPlayers.length) { //if reached the current generation then exit out of the showing generations mode
          showBestEachGen = false;
        } else {
          genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
        }
      } else if (humanPlaying) { //if the user is playing then move player right

        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      }
      break;
  }
}
