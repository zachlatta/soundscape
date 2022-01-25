//// UTILITIES

import { v4 as uuidLib } from 'uuid'
const uuid = uuidLib

const elementFromHTML = (html: string): HTMLElement => {
    let div = document.createElement('div')
    div.innerHTML = html.trim()
    return div.firstChild as HTMLElement
}

//// APP LOGIC

const welcome = document.getElementById('welcome')
const welcomeButton = document.getElementById('welcomeButton')

const app = document.getElementById('app')
const addSoundSourceForm = document.getElementById('addSoundSource') as HTMLFormElement

class SoundSource {
    id: string
    url: string
    el: HTMLElement
    destroyCallback: (SoundSource) => void

    private destroyId() { return `${this.id}-destroy` }

    constructor(url: string, destroyCallback: (SoundSource) => void) {
        this.id = uuid()
        this.url = url
        this.el = elementFromHTML(`
            <div class="soundSource" id="${this.id}">
                <p>${this.url}</p>
                <button id="${this.destroyId()}">x</button>
            </div>
        `)
        this.destroyCallback = destroyCallback
    }

    appendTo(parentInDocument: HTMLElement) {
        parentInDocument.appendChild(this.el)

        document.getElementById(this.destroyId()).addEventListener('click', e => {
            this.destroyCallback(this)
        })
    }
}

let soundSources: SoundSource[] = []

addSoundSourceForm.addEventListener('submit', e => {
    e.preventDefault()

    const data = new FormData(addSoundSourceForm)
    const url = data.get('url') as string

    if (url == '') {
        return
    }

    const soundSource = new SoundSource(url, (toDestroy: SoundSource) => {
        toDestroy.el.remove()
        soundSources.splice(soundSources.indexOf(toDestroy), 1) // remove
    })

    soundSources.push(soundSource)
    soundSource.appendTo(app)

    addSoundSourceForm.reset()
})

// start the app when they click the welcome button!
const startApp = () => {
    welcome.style.display = 'none'
    app.style.display = 'block'
}
welcomeButton.addEventListener('click', startApp)