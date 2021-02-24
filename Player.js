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

    this.polys = []

    this.speed = 10

    this.motorState = 2

    this.rotationTorque = 2

    this.joints = []
    this.genomeInputs = 5;
    this.genomeOutputs = 2;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);

    //--------
    //Ground
    this.bodies.push(makeBox(this.world, b2Body.b2_staticBody, 500, height*2, width*1000, 100, 1, 100000, 0.1))
    this.bodyScales.push([width*1000, 100])

    //main Body
    this.bodies.push(makeBox(this.world, b2Body.b2_dynamicBody, 500, 200, 80, 30, 1, 100000000, 0.1))
    this.bodyScales.push([80, 30])

    this.bodies.push(makeBox(this.world, b2Body.b2_dynamicBody, 500, 156, 15, 30, 1, 100000000, 0.1))
    this.bodyScales.push([15, 30])
    this.bodies[this.bodies.length-1].SetUserData("body")

    //Wheel
    this.wheels.push(makeCircle(this.world, b2Body.b2_dynamicBody, 430, 270, 20, 10, 100000000, 0.1))
    this.wheelsScales.push(20)

    //Wheel2
    this.wheels.push(makeCircle(this.world, b2Body.b2_dynamicBody, 570, 270, 20, 10, 100000000, 0.1))
    this.wheelsScales.push(20)


    this.wheels.push(makeCircle(this.world, b2Body.b2_dynamicBody, 500, 100, 20, 10, 100000000, 0.1))
    this.wheelsScales.push(20)
    this.wheels[2].SetUserData("body")
    //Poly
    //this.polys.push(makePoly(this.world, b2Body.b2_staticBody, [new b2Vec2(900/SCALE, 650/SCALE), new b2Vec2(700/SCALE, 650/SCALE), new b2Vec2(950/SCALE, 450/SCALE)], 10, 100, 100, 100))


      this.vectors = terrain



        for (var i=1;i<this.vectors.length;i++){
          this.polys.push(makePoly(this.world, b2Body.b2_staticBody, [this.vectors[i-1], this.vectors[i]], 10, 100, 100, 100))
          this.polys[this.polys.length-1].SetUserData("ground")
        }



    //------Revolute Wheel Joints
    let wheelJoint = new b2RevoluteJointDef()
    wheelJoint.bodyA = this.bodies[1];
    wheelJoint.bodyB = this.wheels[0];
    wheelJoint.collideConnected = false;
    wheelJoint.localAnchorA.Set(-70/SCALE, 50/SCALE)
    wheelJoint.localAnchorB.Set(0, 0)
    wheelJoint.enableMotor = false

    this.joints.push(this.world.CreateJoint(wheelJoint))


    wheelJoint = new b2RevoluteJointDef()
    wheelJoint.bodyA = this.bodies[1];
    wheelJoint.bodyB = this.wheels[1];
    wheelJoint.collideConnected = false;
    wheelJoint.localAnchorA.Set(70/SCALE, 50/SCALE)
    wheelJoint.localAnchorB.Set(0, 0)
    wheelJoint.enableMotor = false

    this.joints.push(this.world.CreateJoint(wheelJoint))


    let bobby = new b2RevoluteJointDef()

    bobby.bodyA = this.bodies[1];
    bobby.bodyB = this.bodies[2];
    bobby.collideConnected = false;
    bobby.localAnchorA.Set(0, -45/SCALE)
    bobby.localAnchorB.Set(0, 15/SCALE)
    bobby.enableLimit = true
    bobby.upperAngle = radians(45)
    bobby.lowerAngle = radians(-45)

    this.joints.push(this.world.CreateJoint(bobby))


    bobby = new b2RevoluteJointDef()

    bobby.bodyA = this.wheels[2];
    bobby.bodyB = this.bodies[2];
    bobby.collideConnected = false;
    bobby.localAnchorA.Set(0, 20/SCALE)
    bobby.localAnchorB.Set(0, -20/SCALE)
    bobby.enableLimit = true
    bobby.upperAngle = radians(1)
    bobby.lowerAngle = radians(-1)

    this.joints.push(this.world.CreateJoint(bobby))



    this.startx = 500




    this.listener = new Box2D.Dynamics.b2ContactListener;
    this.listener.dead = false
    this.world.SetContactListener(this.listener);

    this.listener.BeginContact = function(contact) {

      // console.log(contact.GetFixtureA().GetBody().GetUserData());
      let fixA = contact.GetFixtureA().GetBody().GetUserData()
      let fixB = contact.GetFixtureB().GetBody().GetUserData()

      if (fixA == "ground" && fixB == "body" || fixA == "body" && fixB == "ground") {

        this.dead = true


      }


    }

    this.listener.EndContact = function(contact) {
      // console.log(contact.GetFixtureA().GetBody().GetUserData());
    }

    this.listener.PreSolve = function() {

    }

  }


  motorOn(forward) {
   var motorSpeed = this.speed;
   this.joints[0].EnableMotor(true);
   this.joints[1].EnableMotor(true);
   var oldState = this.motorState;
   if (forward) {
     this.motorState = 1;
     this.joints[0].SetMotorSpeed(-motorSpeed * PI);
     this.joints[1].SetMotorSpeed(-motorSpeed * PI);

     this.bodies[0].ApplyTorque(-this.rotationTorque);


   } else {
     this.motorState = -1;
     this.joints[0].SetMotorSpeed(motorSpeed * PI);
     this.joints[1].SetMotorSpeed(motorSpeed * PI);

     // this.chassisBody.ApplyTorque(this.rotationTorque);

   }
   if (oldState + this.motorState == 0) {
     if (oldState == 1) {
       this.applyTorque(this.motorState * -1);
     }
     // this.chassisBody.ApplyTorque(this.motorState * (-1) * this.rotationTorque);
   }
   // this.chassisBody.ApplyTorque(this.motorState * (-1) * this.rotationTorque);
   // //console.log(this.wheels[0].joint);
   this.joints[0].SetMaxMotorTorque(700);
   this.joints[1].SetMaxMotorTorque(350);
   // //console.log(this.wheels[0].rimBody.GetAngle() - this.chassisBody.GetAngle());
 }

 applyTorque(direction) {
   this.bodies[1].ApplyTorque(direction * this.rotationTorque);
 }
 motorOff() {
   switch (this.motorState) {
     case 1:
       this.bodies[0].ApplyTorque(this.motorState * this.rotationTorque);
       break;
   }
   this.motorState = 0;

   this.joints[0].EnableMotor(false);
   this.joints[1].EnableMotor(false);
 }



  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  show() {
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace

      for (var i=0;i<this.wheels.length;i++){
        push()
        translate(this.wheels[i].GetPosition().x*SCALE+offset.x, this.wheels[i].GetPosition().y*SCALE)
        rotate(this.wheels[i].GetAngle())

        circle(0, 0, this.wheelsScales[i]*2)
        line(0, 0, this.wheelsScales[i], 0)
        pop()
      }

      for (var i=0;i<this.bodies.length;i++){
        push()
        translate(this.bodies[i].GetPosition().x*SCALE+offset.x, this.bodies[i].GetPosition().y*SCALE)
        rectMode(CENTER)
        rotate(this.bodies[i].GetAngle())
        rect(0, 0, this.bodyScales[i][0]*2, this.bodyScales[i][1]*2)

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
      this.lifespan++

      this.fitness = this.bodies[1].GetPosition().x*SCALE-this.startx


      if (this.bodies[1].GetPosition().y*SCALE > height)[
        this.dead = true
      ]


      if (this.listener.dead || this.lifespan % 5000 == 0){
        this.dead = true
      }
    }
    //----------------------------------------------------------------------------------------------------------------------------------------------------------
  getPositions(x, numberOfPositions, skip) {
  var returnList = [];
  for (var i = 0; i < this.vectors.length; i++) {
    if (this.vectors[i].x >= x) {
      for (var j = 0; j < min(skip * numberOfPositions, this.vectors.length - i); j += skip) {
        returnList.push(this.vectors[i + j].y);
      }
      break;
    }
  }
  while (returnList.length < numberOfPositions) {
    returnList.push(returnList[returnList.length - 1]);
  }
  return returnList;
}

  look() {
    this.vision = [];
      this.vision[0] = this.bodies[1].GetAngle();
      while (this.vision[0] < 0) {
        this.vision[0] += 2 * PI;
      }
      this.vision[0] = (this.vision[0] + PI) % (2 * PI);
      this.vision[0] = map(this.vision[0], 0, 2 * PI, 0, 1);
      this.lastGrounded++;
      if (this.wheels[0].onGround || this.wheels[1].onGround) {
        this.vision[1] = 1;
        this.lastGrounded = 0;
      } else {
        if (this.lastGrounded < 10) {
          this.vision[1] = 1;
        } else {
          this.vision[1] = 0;
        }

      }
      //
      // this.vision[2] = map(this.car.chassisBody.GetLinearVelocity().x, -17, 17, -1, 1);
      // this.vision[3] = map(this.car.chassisBody.GetLinearVelocity().y, -12, 12, -1, 1);
      this.vision.push(map(this.bodies[1].GetAngularVelocity(), -4, 4, -1, 1));

      // this.vision[3] = this.car.chassisBody.GetLinearVelocity().y;
      // this.vision[4] = this.car.chassisBody.GetAngularVelocity();
      //
      //
      //


      let temp = (this.getPositions(this.bodies[1].GetPosition().x, 2, 5));
      let first = temp[0];
      this.vision.push(map(constrain(first - this.bodies[1].GetPosition().y - this.bodyScales[1][1] / SCALE, 0, 10), 0, 10, 0, 1));

      for (var i = 1; i < temp.length; i++) {
        temp[i] -= first;
        temp[i] = map(temp[i], -3, 3, -1, 1);
        this.vision.push(temp[i]);
      }

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
    if (max < 0.6) {
      if (this.motorState == 2) {
        return;
      }

      this.motorOff();
      this.motorState = 2;
      return;
    }

    switch (maxIndex) {
      case 0:
        if (this.motorState == 0) {
          return;
        }
        this.motorOn(true);
        this.motorState = 0;
        break;
      case 1:
        if (this.motorState == 1) {
          return;
        }
        this.motorOn(false);
        this.motorState = 1;
        break;
        // case 2:
        //   if (this.motorState == 2) {
        //     return;
        //   }
        //
        //   this.car.motorOff();
        //   this.motorState = 2;
        //   break;
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
