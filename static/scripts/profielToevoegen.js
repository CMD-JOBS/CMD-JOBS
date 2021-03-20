console.log ("hello");

// Preview uploaded profilePic
const prPic = document.querySelector('#prPic');

prPic.addEventListener('change', setPreviewProfilePic);

function setPreviewProfilePic() {
    profilePic.src=URL.createObjectURL(event.target.files[0]);
}


// Button volgende

const buttonVolgende = document.querySelector('#buttonVolgende');
const profileForm = document.querySelector('.profielToevoegen form');
const formActive1 = document.querySelector('.profielToevoegen > div:last-of-type span:first-of-type');
const formActive2 = document.querySelector('.profielToevoegen > div:last-of-type span:last-of-type');

buttonVolgende.addEventListener('click', volgendeForm);

function volgendeForm() {
    if (buttonVolgende.innerHTML === "Volgende") {
        buttonVolgende.innerHTML = "Terug";
    } 
    else {
        buttonVolgende.innerHTML = "Volgende";
    }

    profileForm.classList.toggle("volgendeForm");
    formActive1.classList.toggle('formActive');
    formActive2.classList.toggle('formActive');
}