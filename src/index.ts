import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
				// const result = await db("users")
        // res.status(200).send({ message: "Pong!", result })
        res.status(200).send({ message: "Pong!"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/users", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string | undefined
    if(searchTerm === undefined) {
      const result = await db('users')
      res.status(200).send(result)
    }else{
      const result = await db('users').where("name", "LIKE", `%${searchTerm}%`)
      res.status(200).send(result)
    }

  } catch (error) {
      console.log(error)

      if (req.statusCode === 200) {
          res.status(500)
      }

      if (error instanceof Error) {
          res.send(error.message)
      } else {
          res.send("Erro inesperado")
      }
  }
})

app.post("/users", async (req: Request, res: Response) => {
  try {
    const {id, name, email, password} = req.body

    if(typeof id !== "string"){
      res.status(400)
      throw new Error("id deve ser string")
    }
    if(id.length < 4){
      res.status(400)
      throw new Error("id deve ter pelo menos 4 caracteres")
    }
    if(id[0] !== "f") {
      res.status(400)
      throw new Error("id deve iniciar com a letra 'f'")
    }
    if(typeof name !== "string"){
      res.status(400)
      throw new Error("id deve ser string")
    }
    if(name.length < 2){
      res.status(400)
      throw new Error("id deve ter pelo menos 2 caracteres")
    }
    if(typeof email !== "string"){
      res.status(400)
      throw new Error("id deve ser string")
    }
		if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

    //Todo selec retorna um array então se desestruturar pega o primeiro item
    //resultado vai ser um array vazio ou um array com o item encontrado
    const [userIdAlreadyExist]: TUserDB[] = await db("users").where({id})

    if(userIdAlreadyExist){
      res.status(400)
      throw new Error("Este id já existe")
    }

    const [userEmailAlreadyExist]: TUserDB[] = await db("users").where({email})

    if(userEmailAlreadyExist){
      res.status(400)
      throw new Error("Este email já existe")
    }

    const newUser: TUserDB = {id, name, email, password}
    await db('users').insert(newUser)

    res.status(201).send({
      message: "User criado com sucesso.",
      user: newUser
    })

  } catch (error) {
      console.log(error)

      if (req.statusCode === 200) {
          res.status(500)
      }

      if (error instanceof Error) {
          res.send(error.message)
      } else {
          res.send("Erro inesperado")
      }
  }
})

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id

    if(idToDelete[0] !== "f") {
      res.status(400)
      throw new Error("id deve iniciar com a letra 'f'")
    }
    
    const [userIdAlreadyExist]: TUserDB[] | undefined = await db('users').where({id: idToDelete})

    if(!userIdAlreadyExist) {
      res.status(404)
      throw new Error('id não encontrado')
    }

    await db('users').del().where({id: idToDelete})
    res.status(200).send({message: "User deletado com sucesso."})

  } catch (error) {
      console.log(error)

      if (req.statusCode === 200) {
          res.status(500)
      }

      if (error instanceof Error) {
          res.send(error.message)
      } else {
          res.send("Erro inesperado")
      }
  }
})

// ========== TASKS

app.get("/tasks", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string | undefined

    if(searchTerm === undefined) {
      const result = await db('tasks')
      res.status(200).send(result)
    }else{
      const result = await db('tasks')
        .where("title", "LIKE", `%${searchTerm}%`)
        .orWhere("description", "LIKE", `%${searchTerm}%`)
        
      res.status(200).send(result)
    }

  } catch (error) {
      console.log(error)

      if (req.statusCode === 200) {
          res.status(500)
      }

      if (error instanceof Error) {
          res.send(error.message)
      } else {
          res.send("Erro inesperado")
      }
  }
})