import express from 'express'
import axios from 'axios'
import pg from 'pg'

const app = express()
const PORT = 3000

const pgClient = new pg.Client({
    user: 'postgres',
    password: 'jesus',
    host: 'localhost',
    database: 'books',
    port: 5433
})
await pgClient.connect()

let books = await getBooksFromDB()

async function getBooksFromDB() {
   const res = await pgClient.query('select * from book_reviews')
   console.log(res.rows)
   return res.rows
}

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use((req, res, next) => {
    console.log('in custom middleware')
    next()
})

app.get('/', (req, res) => {
    const data = {
        books: books
    };
    res.render('index', data)
})

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})