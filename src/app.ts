const welcome = document.getElementById('welcome')
const welcomeButton = document.getElementById('welcomeButton')

const app = document.getElementById('app')

// start the app when they click the welcome button!
const startApp = () => {
    welcome.style.display = 'none'
    app.style.display = 'block'
}
welcomeButton.addEventListener('click', startApp)