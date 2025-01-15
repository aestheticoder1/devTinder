const express = require('express')

const app = express()

app.use('/test',(req,res)=>{
    res.send('This is a test route!')
})

app.use('/',(req,res)=>{
    res.send('Hello, Express!')
})


app.listen(7777,()=>{
    console.log('Server is running on port 7777');
});