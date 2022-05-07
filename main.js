//TOGGEL DEL MENU RESPONSIVE

// Inicializamos la Libreria AOS
AOS.init();

let menu = document.getElementById('menu');

let menu_bar = document.getElementById('menu-bar');

menu_bar.addEventListener('click', function(){

menu.classList.toggle('menu-toggle')

// CALENDARIO

})

let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December'];

let currentDate = new Date();
let currentDay = currentDate.getDate();
let monthNumber = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let dates = document.getElementById('dates');
let month = document.getElementById('month');
let year = document.getElementById('year');

let prevMonthDOM = document.getElementById('prev-month');
let nextMonthDOM = document.getElementById('next-month');

month.textContent = monthNames[monthNumber];
year.textContent = currentYear.toString();

prevMonthDOM.addEventListener('click', ()=>lastMonth());
nextMonthDOM.addEventListener('click', ()=>nextMonth());



const writeMonth = (month) => {

    for(let i = startDay(); i>0;i--){
        dates.innerHTML += ` <div class="calendar__date calendar__item calendar__last-days">
            ${getTotalDays(monthNumber-1)-(i-1)}
        </div>`;
    }

    for(let i=1; i<=getTotalDays(month); i++){
        if(i===currentDay) {
            dates.innerHTML += ` <div class="calendar__date calendar__item calendar__today">${i}</div>`;
        }else{
            dates.innerHTML += ` <div class="calendar__date calendar__item">${i}</div>`;
        }
    }
}

const getTotalDays = month => {
    if(month === -1) month = 11;

    if (month == 0 || month == 2 || month == 4 || month == 6 || month == 7 || month == 9 || month == 11) {
        return  31;

    } else if (month == 3 || month == 5 || month == 8 || month == 10) {
        return 30;

    } else {

        return isLeap() ? 29:28;
    }
}

const isLeap = () => {
    return ((currentYear % 100 !==0) && (currentYear % 4 === 0) || (currentYear % 400 === 0));
}

const startDay = () => {
    let start = new Date(currentYear, monthNumber, 1);
    return ((start.getDay()-1) === -1) ? 6 : start.getDay()-1;
}

const lastMonth = () => {
    if(monthNumber !== 0){
        monthNumber--;
    }else{
        monthNumber = 11;
        currentYear--;
    }

    setNewDate();
}

const nextMonth = () => {
    if(monthNumber !== 11){
        monthNumber++;
    }else{
        monthNumber = 0;
        currentYear++;
    }

    setNewDate();
}

const setNewDate = () => {
    currentDate.setFullYear(currentYear,monthNumber,currentDay);
    month.textContent = monthNames[monthNumber];
    year.textContent = currentYear.toString();
    dates.textContent = '';
    writeMonth(monthNumber);
}

writeMonth(monthNumber);

/*Animacion*/

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

window.addEventListener('scroll', function() {
    
    let animacion = document.getElementById('animado3');
    let posicionObj1 = animacion.getBoundingClientRect().top;
    console.log(posicionObj1);

    let tamañoDePantalla = window.innerHeight/2;

    if (posicionObj1 < tamañoDePantalla) {

        animacion.style.animation='moverL 1s ease-out';


    }



})

//SCROLL
ScrollReveal().reveal('.stripe-container', { delay: 200 });
ScrollReveal().reveal('.banner', { delay: 500 });
ScrollReveal().reveal('.tagline', { delay: 500 });
ScrollReveal().reveal('.social', { delay: 500 });
ScrollReveal().reveal('.widget', { interval: 300 });
ScrollReveal().reveal('.card', { interval: 500 });

//ANIMACION DEL TITULO

var txt= "Vosco-Iluminamos tu Vida-Siguenos ";
var espera= 100;
var refresca = null;

function titulo(){
  
  document.title = txt;

  txt = txt.substring(1,txt.length)+txt.charAt(0);

  refresca= setTimeout("titulo()",espera);

}

titulo();

//MODO OSCURO

const btnSwitch = document.querySelector('#switch');

btnSwitch.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    btnSwitch.classList.toggle('active');
});

//Efecto de Escritura (ANIMADA) 

const typed = new Typed('.typed', {
    strings: ['Te ofrecemos lo mejor en iluminacion',
    'Iluminamos tu vida', 
    'Se una luz para ti y tus vecinos' ],

    typedSpeed: 70,
    startDelay: 500,
    backSpeed: 75,
    smartBackspace: true,
    backDelay: 1000,
    loop: true,
    loopCount: false, 
    cursorChar:'',

});

//https://www.youtube.com/watch?v=bSHitSCqWr8