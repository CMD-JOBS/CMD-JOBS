let saveresbutton = document.getElementById("savebutton");

console.log("hoi");

saveresbutton.addEventListener("mouseover", function() {
    document.getElementById("heart").src = "images/savebutton2.svg";
    console.log("I hover");
})

saveresbutton.addEventListener("mouseleave", function() {
    document.getElementById("heart").src = "images/savebutton.svg";
})