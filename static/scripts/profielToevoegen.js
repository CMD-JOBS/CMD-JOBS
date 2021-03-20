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

buttonVolgende.addEventListener('click', volgendeForm);

function volgendeForm() {
    if (buttonVolgende.innerHTML === "Volgende") {
        buttonVolgende.innerHTML = "Terug";
    } 
    else {
        buttonVolgende.innerHTML = "Volgende";
    }

    profileForm.classList.toggle("volgendeForm");
}