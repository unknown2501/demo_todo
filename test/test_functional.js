
const App = require('../src/app')
const supertest = require('supertest')
const expect = require('chai').expect

const app = new App({
    db:':memory:'
})
const request = supertest(app.app.listen(3000))

describe('API functional basic tests',()=>{
    beforeEach((done)=>{
        app.db.serialize(()=>{
            app.db.run(
                `DELETE FROM todos`
            )
            app.db.run(
                `INSERT INTO todos (user_id,content,done) VALUES 
                (1,'Do 1',0),
                (1,'Do 2',1),
                (2,'Do 3',1),
                (2,'Do 4',0),
                (3,'Do 5',0)`
            )
        })
        done()
    })
    it('GET /',(done)=>{
        request
            .get('/')
            .expect(200)
            .end((err,res)=>{                
                expect(res.body.todo).equal('hello')
                done()
            })
    })
    it('GET /todos/:user_id',(done)=>{
        
        request
            .get('/todos/1')
            .expect(200)
            .end((err,res)=>{
                res.body.data.forEach(x => {
                    delete x.id
                    delete x.user_id
                    
                })                
                expect(res.body.data).to.deep.have.members(
                    [{content:'Do 1',done:0},
                    {content:'Do 2',done:1}]
                )
                done()
            })
    })
    it('POST /todos',(done)=>{

        request
            .post('/todos')
            .send({
                content:'Do 5',

            })
            .expect(201)
            .end((err,res)=>{
                
                done()
            })        
    })
})
