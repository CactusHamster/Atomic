// proton is 1.6726219 × 10^-27 kg
// protons have a charge of 1.602176634×10^−19 coulombs
// volume = mass / density

function random (min, max) { return Math.floor(Math.random() * (max - min + 1) ) + min; }

class Simulation {
    constructor (ctx, options = {}) {
        this.particles = []
        this.ctx = ctx.constructor.name == 'CanvasRenderingContext2D' ? ctx : ctx.getContext('2d')
        this.min = options.min ?? [0, 0]
        this.max = [ctx.canvas.width, ctx.canvas.height]
        this.maxDistance = Math.sqrt((this.max[0] - this.min[0])**2 - (this.max[1] - this.min[1])**2);
        this.scale = options.scale ?? 1
    }
    static acceleration (p1, p2) {
        let acceleration = [0, 0]
        let posDif = p1.coords.map((coord, i) => coord - p2.coords[i])
        let distance = Math.sqrt(posDif[0]**2 + posDif[1]**2)
        /*
        Constant of gravity
        6.67 * (10**-11)    N*m^2*kg^2
        or
        1.5 * (10**-11)     lb*m^2*kg^2
        */
        let G = 6.67 * (10**-11)
        let gravityForce = (G * p1.mass * p2.mass) / (distance**2)
        let gravityAcceleration = acceleration.map((acel, i) => acel - ((posDif[i] / distance) * gravityForce * p1.mass ) )
        let chargeForce = ((0.25 * Math.PI * 8.85418782*(10**-12)) * p1.charge * p2.charge) / (distance**2)
        let chargeAcceleration = acceleration.map((acel, i) => acel + ( ((posDif[i] / distance) * chargeForce * p1.mass) ) )
        acceleration = gravityAcceleration.map((acel, i) => acel + chargeAcceleration[i])
        return acceleration
    }
    particle (options = {}) {
        let particle = {}
        particle.density = options.density ?? 1
        particle.mass = options.mass ?? 1 /* in grams */
        particle.charge = options.charge ?? 0 //random(-1, 1) /* coulombs */
        particle.coords = options.coords ?? [options.x ?? 0, options.y ?? 0] /* meters  */
        particle.color = options.color ?? 'red'
        delete options.x
        delete options.y
        particle.velocity = options.velocity ?? [(options.vx ?? 0), (options.vy ?? 0)]
        particle.coords = particle.coords.map(xy => xy * this.scale)
        this.particles.push(particle)
    }
    calculate () {
        let accelerations = this.particles.map((particle, currentIndex) => {
			let acceleration = [0,0]
            this.particles.forEach((otherParticle, otherIndex) => {
                if (currentIndex == otherIndex) return;
				let newAcel = this.constructor.acceleration(particle, otherParticle)
                acceleration = acceleration.map((acel, i) => acel + newAcel[i])
                //particle.velocity = particle.velocity.map((vel, i) => vel + acceleration[i])
            });
            return acceleration;
        })
		let velocities = this.particles.map((particle, i) => particle.velocity.map((vel, ind) => vel + accelerations[i][ind]))
        this.particles = this.particles.map((particle, i) => {
			particle.velocity = velocities[i]
			particle.coords = particle.coords.map((xy, i) => xy + particle.velocity[i])
			return particle
		})
    }
    render () {
        for (let particle of this.particles) {
            let radius = ( (((3/Math.PI)**(1/3)) * (particle.mass**(1/3))) / ((2**(2/3)) * (particle.density ** (1/3))) ) / this.scale
            this.ctx.beginPath()
            this.ctx.fillStyle = particle.color
            this.ctx.arc(...particle.coords.map(coord => coord / this.scale), radius, 0, Math.PI * 2)
            this.ctx.fill()
        }
        
    }
}