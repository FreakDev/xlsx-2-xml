const ipc = require('electron').ipcRenderer;

const log = function () {
    console.log.apply(console, Array.prototype.slice.call(arguments))
    ipc.send('log', Array.prototype.slice.call(arguments))
}

window.addEventListener('DOMContentLoaded', function () {

    let file,
        sampleLink = document.querySelector('a'),
        button = document.querySelector('button'),
        fileDisplay = document.querySelector('#file'),
        pathDisplay = document.querySelector('#path')

    sampleLink.addEventListener('click', function(ev) {
        ipc.send('download-sample')
        ev.preventDefault()
    })

    button.addEventListener('click', function (ev) {
        if (!ev.target.disabled)
            ipc.send('convert', file)
    })
    
    document.ondragover = document.ondrop = (ev) => {
        ev.preventDefault()
    }

    document.body.ondrop = function (ev) {
        ev.preventDefault()
        
        file = ev.dataTransfer.files[0].path
        
        button.disabled = false
        fileDisplay.classList.add('file-ok')
        pathDisplay.innerText = file

        log('drop', file)

        return false
    }

})
