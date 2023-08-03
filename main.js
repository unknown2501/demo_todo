
const App = require('./src/app')

const app = new App({
    db:'./main.db'
})
app.run({
    port:3000
})
