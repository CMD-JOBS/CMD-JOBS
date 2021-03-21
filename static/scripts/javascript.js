console.log("hello");

var bewerkKnop = document.getElementById("bewerk-knop");

function textareaBewerken() {
    var textarea = document.querySelector("textarea");
    textarea.classList.toggle("bewerk-textarea");
}
bewerkKnop.addEventListener("click", textareaBewerken);


function selectBewerken() {
    var selectBox, i;
    selectBox = document.querySelectorAll("select");
    for (i = 0; i < selectBox.length; i++) {
        selectBox[i].classList.toggle("bewerk-select");
    }
}
bewerkKnop.addEventListener("click", selectBewerken);


function showBewerktVerzendKnop() {
    var bewerktVerzendKnop = document.getElementById("bewerkt-verzend-knop");
    bewerktVerzendKnop.classList.toggle("laat-bewerkt-verzend-knop-zien");
}
bewerkKnop.addEventListener("click", showBewerktVerzendKnop);


// var bewerkKnop = document.getElementById("bewerk-knop");

// function textareaBewerken() {
//     var textarea = document.querySelector("textarea");
//     textarea.classList.toggle("bewerk-textarea");

//     var selectBox, i;
//     selectBox = document.querySelectorAll("select");
//     for (i = 0; i < selectBox.length; i++) {
//         selectBox[i].classList.toggle("bewerk-select");
//     }

//     var bewerktVerzendKnop = document.getElementById("bewerkt-verzend-knop");
//     bewerktVerzendKnop.classList.toggle("laat-bewerkt-verzend-knop-zien");

// }
// bewerkKnop.addEventListener("click", textareaBewerken); 