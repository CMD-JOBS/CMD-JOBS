console.log ("hello");

// Preview uploaded profilePic
const prPic = document.querySelector('#prPic');

prPic.addEventListener('change', setPreviewProfilePic);

function setPreviewProfilePic() {
    profilePic.src=URL.createObjectURL(event.target.files[0]);
}
