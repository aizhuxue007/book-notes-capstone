import express from 'express'
import axios from 'axios'
import pg from 'pg'
import bodyParser from 'body-parser'
import methodOverride from 'method-override';

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

async function getBooksFromDB() {
   const res = await pgClient.query('select * from book_reviews')
   console.log(res.rows)
   return res.rows
}

async function postBookToDB(book) {
    const query = `insert into book_reviews (title, rating, review, img_url) values ($1, $2, $3, $4)`
    try {
        await pgClient.query(query, [
            book.title, book.rating, book.review, book.img_url
        ])
        console.log('Inserted record successfully!')
    } catch (error) {
        console.error('Error inserting record:', error);
    }
}

async function getBookCover(title) {
    const url = `https://openlibrary.org/search.json?title=`
    const res = await axios.get(url + title +'&limit=1')
    return res.data.docs[0].isbn[0]
}

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
    const books = await getBooksFromDB()
    const data = {
        books: books
    };
    res.render('index', data)
})

app.get('/add', (req, res) => {
    res.render('new')
})

app.post('/add', async (req, res) => {
    const book = {
        title: req.body.title.trim(),
        rating: req.body.rating,
        review: req.body.review
    }
    const book_isbn = await getBookCover(book.title)
    book.img_url = `https://covers.openlibrary.org/b/isbn/${book_isbn}-M.jpg`
    await postBookToDB(book)
    res.redirect('/')
})

app.patch('/edit', (req, res) => {
    const bookId = req.body.bookId
    console.log(bookId)
    res.send(`Handling PATCH request for book ID: ${bookId}`)
})

app.delete('/delete', (req, res) => {
    const bookId = req.body.bookId
    console.log(bookId)
    res.send(`Handling PATCH request for book ID: ${bookId}`)
})

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})