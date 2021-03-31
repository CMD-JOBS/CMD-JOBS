console.log("hello");

var bewerkKnop = document.querySelector(".bewerk-knop");
var bewerktVerzendKnop = document.querySelector("#bewerkt-verzend-knop");
var textarea = document.querySelector("textarea");
var selectBox = document.querySelectorAll("select");
var selectBox, i;

window.onload = function () {

  bewerkKnop.classList.add("js-aan-bewerkknop");
  textarea.classList.add("js-aan-textarea");

  for (i = 0; i < selectBox.length; i++) {
    selectBox[i].classList.add("js-aan-select");
  }
  bewerktVerzendKnop.classList.add("js-aan-verzendknop");
};

function veldenBewerkbaarMaken() {
  textarea.classList.toggle("js-aan-textarea");
  textarea.classList.toggle("bewerk-textarea");

  for (i = 0; i < selectBox.length; i++) {
    selectBox[i].classList.toggle("js-aan-select");
  }
  bewerktVerzendKnop.classList.toggle("js-aan-verzendknop");
}
bewerkKnop.addEventListener("click", veldenBewerkbaarMaken);

console.log("hello");