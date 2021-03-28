//Set-up progressive enhanchement 
const profileForm = document.querySelector('.profielToevoegen form');
const buttonVolgende = document.querySelector('#buttonVolgende');
const formActive = document.querySelector('.profielToevoegen > div:last-of-type');
const formActive1 = document.querySelector('.profielToevoegen > div:last-of-type span:first-of-type');
const formActive2 = document.querySelector('.profielToevoegen > div:last-of-type span:last-of-type');
const pFoto = document.querySelector('#pFoto');


// #1 Split up form fields
function splitForm() {
    profileForm.classList.add("form-split");
    formActive.setAttribute("id", "visable-flex");
    buttonVolgende.setAttribute("id", "visable-inline-block");
};

window.addEventListener('load',splitForm);



// #2 Switch naar volgende form fields
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

buttonVolgende.addEventListener('click', volgendeForm);
formActive1.addEventListener('click', volgendeForm);
formActive2.addEventListener('click', volgendeForm);



// #3 Preview & validate uploaded profielFoto
function setPreviewProfielFoto() {
    const filePath = pFoto.value;
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    
    if (!allowedExtensions.exec(filePath)) {
        alert('Je moet een foto bestand uploaden');
        filePath = '';
        return false;
    } 
    else 
    {
        profielFoto.src=URL.createObjectURL(event.target.files[0]);
    }
};

pFoto.addEventListener('change', setPreviewProfielFoto);



// #4 Invalid fields rode achtergrond geven als feedback
const pFotoField = document.querySelector('.pFoto > span');
const vNaamField = document.querySelector('input[name="vNaam"]');
const aNaamField = document.querySelector('input[name="aNaam"]');
const opleidingsNiveauField = document.querySelector('select[name="opleidingsNiveau"]');
const biografieField = document.querySelector('textarea[name="biografie"]');
const functieField = document.querySelector('select[name="functie"]');
const dienstverbandField = document.querySelector('select[name="dienstverband"]');
const bedrijfsgrootteField = document.querySelector('select[name="bedrijfsGrootte"]');

Array.prototype.slice.call(document.querySelectorAll("[required]")).forEach(function(input){
    input.addEventListener('invalid',function(e){

        //Check aan welke kant de error zit, zo nodig switch naar andere kant
        if (this.name == 'pFoto' || this.name == 'vNaam' || this.name == 'aNaam' || this.name == 'opleidingsNiveau' || this.name == 'biografie') {
            volgendeForm();
        }

        if (this.name == 'pFoto') {
            pFotoField.classList.add('error');
        }
        else if (this.name == 'vNaam') {
            vNaamField.classList.add('error');
        }
        else if (this.name == 'aNaam') {
            aNaamField.classList.add('error');
        }
        else if (this.name == 'opleidingsNiveau') {
            opleidingsNiveauField.classList.add('error');
        }
        else if (this.name == 'biografie') {
            biografieField.classList.add('error');
        }
        else if (this.name == 'functie') {
            functieField.classList.add('error');
        }
        else if (this.name == 'dienstverband') {
            dienstverbandField.classList.add('error');
        }
        else if (this.name == 'bedrijfsGrootte') {
            bedrijfsgrootteField.classList.add('error');
        }
    })
});