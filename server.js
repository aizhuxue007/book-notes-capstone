import express from 'express'
import axios from 'axios'
import pg from 'pg'

const app = express()
const PORT = 3000

let bookList = await getBookImages()

const pgClient = new pg.Client({
    user: 'postgres',
    password: 'jesus',
    host: 'localhost',
    database: 'books',
    port: 5433
})
await pgClient.connect()

async function getBookImages() {
    const response = await axios.get('https://covers.openlibrary.org/b/isbn/9780718013462-M.jpg')

    return response.config
}

app.set('view engine', 'ejs')

app.use((req, res, next) => {
    console.log('in custom middleware')
    next()
})

app.get('/', (req, res) => {
    console.log(bookList.url)
    const data = {
        book: bookList.url,
    };
    res.render('index', data)
})

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})