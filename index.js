require('dotenv').config()
const express = require('express')
const app = express()
// const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
// app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).send(error.message)
  }
  next(error)
}


// homepage
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// get all people on phonebook
app.get('/api/people', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

// info about entires
app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${Person.length} people</p>
    <br>${new Date()}`)
})

// get specific person
app.get('/api/people/:id', (req, res) => {

  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
    })
})

//  delete person
app.delete('/api/people/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(res.status(204).end())
    .catch(error => next(error))
})

// edit person
app.put('/api/people/:id', (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true })
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

// add person
app.post('/api/people', (req, res, next) => {

  if (!req.body.name || !req.body.number) {
    return res.status(400).json('content missing')
  }
  const person = new Person({
    name: req.body.name,
    number: req.body.number
  })
  person.save()
    .then(result => {
      console.log('person saved!')
      res.json(result)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})