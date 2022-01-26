import { Howl } from 'howler'

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
const soundSourcesDiv = document.getElementById('soundSources')
const addSoundSourceForm = document.getElementById('addSoundSource') as HTMLFormElement

enum SoundSourceState {
    Load,
    LoadError,
    Play,
    PlayError
}

class SoundSource {
    id: string
    url: string
    state: SoundSourceState
    el: HTMLElement
    sound: Howl

    destroyCallback: (SoundSource) => void

    dragXOffset: number
    dragYOffset: number

    private destroyId() { return `${this.id}-destroy` }

    constructor(url: string, destroyCallback: (SoundSource) => void) {
        this.id = uuid()
        this.url = url
        this.state = SoundSourceState.Load

        this.el = elementFromHTML(this.outerHTML())

        this.sound = new Howl({
            src: [url],
            html5: true,

            onloaderror: () => { this.state = SoundSourceState.LoadError; this.rerender() },
            onplay: () => { this.state = SoundSourceState.Play; this.rerender() },
            onplayerror: () => { this.state = SoundSourceState.PlayError; this.rerender() }
        }) // html5 enables streaming audio

        this.destroyCallback = destroyCallback

        this.dragXOffset = 0
        this.dragYOffset = 0
    }

    outerHTML() {
        return `
            <div class="soundSource" id="${this.id}">
                ${this.innerHTML()}
            </div>
        `
    }

    innerHTML() {
        const stateText = [
            `Loading ${this.url}...`,
            `Error loading ${this.url}.`,
            `Playing ${this.url}!`,
            `Error playing ${this.url}`
        ][this.state]

        return `
            <p>${stateText} <button id="${this.destroyId()}">x</button></p>
        `
    }

    rerender() {
        this.el.innerHTML = this.innerHTML()

        // teardown, when destroy button is clicked
        document.getElementById(this.destroyId()).addEventListener('click', e => {
            this.sound.stop()

            this.destroyCallback(this)
        })
    }

    appendTo(parentInDocument: HTMLElement) {
        parentInDocument.appendChild(this.el)
        this.rerender()

        this.sound.play()
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
    soundSource.appendTo(soundSourcesDiv)

    addSoundSourceForm.reset()
})

// set up drag and drop logic, from https://www.kirupa.com/html5/drag.htm
let active
let currentX
let currentY
let initialX
let initialY
let xOffset = 0
let yOffset = 0

const dragStart = (e) => {
    active = soundSources.find(s => {
        if (s.el === e.target) {
            return true
        }

        // TODO: Right now it only checks direct children, should be changed to
        // recurse through all children.
        let match = false
        s.el.childNodes.forEach(child => {
            if (child === e.target) {
                match = true
            }
        })

        return match
    })

    if (active == null) {
        return
    }

    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - active.dragXOffset
        initialY = e.touches[0].clientY - active.dragYOffset
    } else {
        initialX = e.clientX - active.dragXOffset
        initialY = e.clientY - active.dragYOffset
    }
}

const dragEnd = (e) => {
    initialX = currentX
    initialY = currentY

    active = null
}

const drag = (e) => {
    if (active) {
        e.preventDefault()

        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX
            currentY = e.touches[0].clientY - initialY
        } else {
            currentX = e.clientX - initialX
            currentY = e.clientY - initialY
        }

        active.dragXOffset = currentX
        active.dragYOffset = currentY

        active.el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
    }
}

soundSourcesDiv.addEventListener('touchstart', dragStart, false)
soundSourcesDiv.addEventListener('touchend', dragEnd, false)
soundSourcesDiv.addEventListener('touchmove', drag, false)

soundSourcesDiv.addEventListener('mousedown', dragStart, false)
soundSourcesDiv.addEventListener('mouseup', dragEnd, false)
soundSourcesDiv.addEventListener('mousemove', drag, false)

// start the app when they click the welcome button!
const startApp = () => {
    welcome.style.display = 'none'
    app.style.display = 'block'
}
welcomeButton.addEventListener('click', startApp)
