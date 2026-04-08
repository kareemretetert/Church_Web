// particles background

function createParticles(){

const container = document.createElement("div");
container.className = "particles";
document.body.appendChild(container);

for(let i=0;i<25;i++){

const p = document.createElement("span");

p.style.left = Math.random()*100+"%";
p.style.animationDelay = Math.random()*10+"s";
p.style.animationDuration = 10 + Math.random()*10+"s";

container.appendChild(p);
}

}

window.addEventListener("load",createParticles);
