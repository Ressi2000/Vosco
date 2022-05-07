//SLIDER ANIMADO 

let slider = document.querySelector(".slider-contenedor")
let sliderIndividual = document.querySelectorAll(".contenido-slider")
let contador = 1;
let width = sliderIndividual[0].clientWidth;
let intervalo = 3000;

window.addEventListener("resize", function(){
    width = sliderIndividual[0].clientWidth;
})

setInterval(function(){
    slides();
},intervalo);



function slides(){
    slider.style.transform = "translate("+(-width*contador)+"px)";
    slider.style.transition = "transform .8s";
    contador++;

    if(contador == sliderIndividual.length){
        setTimeout(function(){
            slider.style.transform = "translate(0px)";
            slider.style.transition = "transform 0s";
            contador=1;
        },1500)
    }
}

//ANIMACIONES

window.addEventListener('scroll', function() {
    
    let animacion = document.getElementById('animado');
    let posicionObj1 = animacion.getBoundingClientRect().top;
    console.log(posicionObj1);

    let tamañoDePantalla = window.innerHeight/2;

    if (posicionObj1 < tamañoDePantalla) {

        animacion.style.animation='mover 1s ease-out';


    }



})

window.addEventListener('scroll', function() {
    
    let animacion = document.getElementById('animado2');
    let posicionObj1 = animacion.getBoundingClientRect().top;
    console.log(posicionObj1);

    let tamañoDePantalla = window.innerHeight/2;

    if (posicionObj1 < tamañoDePantalla) {

        animacion.style.animation='moverL 1s ease-out';


    }



})

//SCROLL
ScrollReveal().reveal('.contenedor2', { delay: 200 });
ScrollReveal().reveal('.contenedor3', { delay: 200 });
ScrollReveal().reveal('.contenedor4', { delay: 200 });
ScrollReveal().reveal('.icono' , { delay: 500 });
ScrollReveal().reveal('.tagline', { delay: 500 });
ScrollReveal().reveal('.social', { delay: 500 });