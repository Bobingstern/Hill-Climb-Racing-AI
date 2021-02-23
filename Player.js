class Player {

  constructor() {

    this.fitness = 0;
    this.vision = []; //the input array fed into the neuralNet
    this.decision = []; //the out put of the NN
    this.unadjustedFitness;
    this.lifespan = 0; //how long the player lived for this.fitness
    this.bestScore = 0; //stores the this.score achieved used for replay
    this.dead = false;
    this.score = 0;
    this.gen = 0;

    this.world = new b2World(new b2Vec2(0, 50))
    this.bodies = []
    this.bodyScales = []

    this.wheels = []
    this.wheelsScales = []
    this.genomeInputs = 5;
    this.genomeOutputs = 2;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

    //--------
    //Ground
    this.bodies.push(makeBox(this.world, b2Body.b2_staticBody, 500, height, width, 100, 1, 0.3, 0.1))
    this.bodyScales.push([width, 100])

    //main Body
    this.bodies.push(makeBox(this.world, b2Body.b2_dynamicBody, 500, 200, 100, 50, 1, 0.3, 0.1))
    this.bodyScales.push([100, 50])

    //Wheel
    this.wheels.push(makeCircle(this.world, b2Body.b2_dynamicBody, 500, 100, 20, 1, 0.3, 0.1))
    this.wheelsScales.push(20)



  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  show() {
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      for (var i=0;i<this.bodies.length;i++){
        push()
        translate(this.bodies[i].GetPosition().x*SCALE, this.bodies[i].GetPosition().y*SCALE)
        rectMode(CENTER)
        rotate(this.bodies[i].GetAngle())
        rect(0, 0, this.bodyScales[i][0]*2, this.bodyScales[i][1]*2)

        pop()
      }

      for (var i=0;i<this.wheels.length;i++){
        push()
        translate(this.wheels[i].GetPosition().x*SCALE, this.wheels[i].GetPosition().y*SCALE)
        rotate(this.wheels[i].GetAngle())

        circle(0, 0, this.wheelsScales[i]*2)

        pop()
      }

    }
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
  move() {
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    }
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
  update() {
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
      this.world.Step(1/60, 10, 10)
    }
    //----------------------------------------------------------------------------------------------------------------------------------------------------------

  look() {
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace

  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //gets the output of the this.brain then converts them to actions
  think() {

      var max = 0;
      var maxIndex = 0;
      //get the output of the neural network
      this.decision = this.brain.feedForward(this.vision);

      for (var i = 0; i < this.decision.length; i++) {
        if (this.decision[i] > max) {
          max = this.decision[i];
          maxIndex = i;
        }
      }

      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    }
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    //returns a clone of this player with the same brian
  clone() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
  //this fuction does that

  cloneForReplay() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;

    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //fot Genetic algorithm
  calculateFitness() {
    this.fitness = random(10);
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  crossover(parent2) {

    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }
}
