import express from 'express'   
import cors from 'cors'
import dotenv from 'dotenv'
import mainRouter from './routes/index'

dotenv.config()
const app = express();
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3000

app.use('/api/v1', mainRouter);


app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})
