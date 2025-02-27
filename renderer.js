const { ipcRenderer } = require("electron");
const path = require("path");
const { text } = require("stream/consumers");
let filenameActive


window.addEventListener('DOMContentLoaded', () => {
    var background = document.querySelector('body');
    var titlebar = document.getElementById('titlebar');
    var icon = document.getElementById('themebuttonicon');
    var save = document.getElementById('savebuttonicon');
    var neww = document.getElementById('newbuttonicon');
    var open = document.getElementById('openbuttonicon');
    var filename = document.getElementById('filenameid');
    var textarea = document.getElementById('textareaid');
    var dys = document.getElementById('dysfont');
    var wordcountt = document.getElementById('wordcountid')

    document.getElementById("themebuttonicon").onclick = function () {
        if (background.style.backgroundColor == 'rgb(43, 45, 49)') {
            background.style.backgroundColor = 'white';
            titlebar.style.backgroundColor = 'grey';
            icon.src = "assets/icons/Darkmode.png";
            save.style.filter = "invert(0%)";
            neww.style.filter = "invert(0%)";
            open.style.filter = "invert(0%)";
            dys.style.filter = "invert(0%)";
            filename.style.color = 'black';
            textarea.style.color = 'black';
            wordcountt.style.color = 'black';

        } else {
            background.style.backgroundColor = "rgb(43, 45, 49)";
            titlebar.style.backgroundColor = 'rgb(30, 31, 34)';
            icon.src = "assets/icons/Lightmode.png";
            save.style.filter = "invert(100%)";
            neww.style.filter = "invert(100%)";
            open.style.filter = "invert(100%)";
            dys.style.filter = "invert(100%)";
            filename.style.color = 'white';
            textarea.style.color = 'white';
            wordcountt.style.color = 'white';
        }
    };


    document.getElementById('dysfont').onclick = function () {
        if (textarea.style.fontFamily !== 'Open-Dyslexic') {
            filename.style.fontFamily = 'Open-Dyslexic';
            textarea.style.fontFamily = 'Open-Dyslexic';
            textarea.style.fontSize = '1.8em';
            wordcountt.style.fontFamily = 'Open-Dyslexic';
        } else {
            filename.style.fontFamily = 'sans-serif';
            textarea.style.fontFamily = 'sans-serif';
            textarea.style.fontSize = '1em';
            wordcountt.style.fontFamily = 'sans-serif';
            wordcountt.style.fontSize = '1em';
        }
    };

    const newButton = document.getElementById('newbuttonicon');
    const openButton = document.getElementById('openbuttonicon')
    const savetext = document.getElementById('textareaid')
    const savebutton = document.getElementById('savebuttonicon')

    openButton.addEventListener("click", () => {
        ipcRenderer.send("open-document-triggered");
    });

    savetext.addEventListener("input", (e => {
        ipcRenderer.send("file-updated", e.target.value)
    }));

    savebutton.addEventListener("click", () => {
        ipcRenderer.send("file-updated-bysave", savetext.value);

    });
    
    ipcRenderer.on("saveresult", (_, result) =>{
        alert(result)
    } )

    newButton.addEventListener("click", () => {
        ipcRenderer.send("create-document-triggered");
    });

    ipcRenderer.on("document-created", (_, filePath) => {
        const filenameActive = path.basename(filePath);
        filename.textContent = filenameActive;    
        textarea.removeAttribute('disabled')
        textarea.textarea.value = "";
        textarea.focus()
        textarea.scroll(0,0)
    });

    ipcRenderer.on("document-opened", (_, data) => {
        const {filePath, content} = data;
        const filenameActive = path.basename(filePath);
        filename.textContent = filenameActive
        textarea.removeAttribute('disabled')
        textarea.value = content
        textarea.focus();
        textarea.scroll(0,0)
    })

    ipcRenderer.on('wordcountsignal', (_, wordCountData) => {
        wordcountt.textContent = `Word Count: ${wordCountData}`;
    });
});
