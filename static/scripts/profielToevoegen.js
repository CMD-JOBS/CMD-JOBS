console.log ("hello");

// Preview uploaded profielFoto
const pFoto = document.querySelector('#pFoto');

pFoto.addEventListener('change', setPreviewProfielFoto);

function setPreviewProfielFoto() {
    profielFoto.src=URL.createObjectURL(event.target.files[0]);
}


// Button volgende

const buttonVolgende = document.querySelector('#buttonVolgende');
const profileForm = document.querySelector('.profielToevoegen form');
const formActive1 = document.querySelector('.profielToevoegen > div:last-of-type span:first-of-type');
const formActive2 = document.querySelector('.profielToevoegen > div:last-of-type span:last-of-type');

buttonVolgende.addEventListener('click', volgendeForm);
formActive1.addEventListener('click', volgendeForm);
formActive2.addEventListener('click', volgendeForm);

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

//Form errors
const pFotoField = document.querySelector('.pFoto > span');
const vNaamField = document.querySelector('input[name="vNaam"]');
const aNaamField = document.querySelector('input[name="aNaam"]');
const opleidingsNiveauField = document.querySelector('select[name="opleidingsNiveau"]');
const biografieField = document.querySelector('textarea[name="biografie"]');
const functieField = document.querySelector('select[name="functie"]');
const dienstverbandField = document.querySelector('select[name="dienstverband"]');
const bedrijfsgrootteField = document.querySelector('select[name="bedrijfsgrootte"]');

//Invalid fields rode achtergrond geven
Array.prototype.slice.call(document.querySelectorAll("[required]")).forEach(function(input){
    input.addEventListener('invalid',function(e){
        
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
        else if (this.name == 'bedrijfsgrootte') {
            bedrijfsgrootteField.classList.add('error');
        }
    })
});