
const Koa = require('koa')
const Router = require('koa-router')
const SQLite3 = require('sqlite3').verbose()

class TodoBE {
    db_init() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users ( 
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    name TEXT
                )`)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS todos ( 
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    user_id INTEGER, 
                    content TEXT,
                    done SMALLINT DEFAULT 0
                )`)
        })
    }

    router_init() {
        this.router.get('/', async (ctx, next) => {

            ctx.body = { todo: 'hello' }

        })
            .get('/todos/:user_id', async (ctx, next) => {

                const user_id = ctx.params.user_id

                const todos = await new Promise((resolve, reject) => {
                    this.db.all(
                        `SELECT * FROM todos WHERE user_id = ?`,
                        [user_id],
                        (err, rows) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(rows);
                            }
                        })
                })

                ctx.body = {
                    data: todos
                }                

            }).post('/todos', async (ctx, next) => {

                const data = ctx.request.body

                const res = await new Promise((resolve, reject) => {
                    this.db.run(
                        `INSERT INTO todos (content,done,user_id) VALUES (?,?,?)`,
                        [data.content, data.done, data.user_id],
                        (err) => {
                            if (err) {
                                reject(err)
                            } else {
                                resolve({
                                    status: 201,
                                    body: {
                                        todo_id: this.db.lastID
                                    }
                                })
                            }
                        })
                })
                ctx.status = res.status
                ctx.body = res.body

                

            }).put('/todos/:todo_id', async (ctx, next) => {

                const data = ctx.request.body
                const todo_id = ctx.params.todo_id

                const res = await new Promise((resolve, reject) => {
                    this.db.run(`UPDATE todos SET content=?, done=? WHERE id=?`,
                        [data.content, data.done, todo_id],
                        (err) => {
                            if (err) {
                                reject(err)
                            } else {
                                resolve({
                                    status: 200,
                                })
                            }
                        }
                    )
                })
                ctx.status = res.status                

            }).delete('/todos/:todo_id', async (ctx, next) => {

                const todo_id = ctx.params.todo_id

                const res = await new Promise((resolve, reject) => {
                    this.db.run(
                        `DELETE FROM todos WHERE id=?`,
                        [todo_id],
                        (err) => {
                            if (err) {
                                reject(err)
                            } else {
                                resolve({
                                    status: 204
                                })
                            }
                        }
                    )
                })
                ctx.status = res.status                

            })
    }

    constructor(params) {

        this.app = new Koa()
        this.db = new SQLite3.Database(params.db)
        this.router = new Router()

        this.db_init()
        this.router_init()
        this.app.use(this.router.routes())
            .use(this.router.allowedMethods())
    }

    run(params) {

        this.app.listen(params.port, () => {
            console.log(`Todo backend server running on port ${params.port}`)
        })
    }
}

module.exports = TodoBE