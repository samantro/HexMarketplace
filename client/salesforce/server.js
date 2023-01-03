const express = require('express');
const {listedNFTs} = require('./listedNFTs.js')
const {myListedNFTs} = require('./myListedNFTs.js')
const {allNFTs} = require('./allNFTs.js')
const app = express();


// accept by routers
app.get('/listedNFTs/:address', async (req,res)=> {
    const data = (await listedNFTs(req.params.address));
    res.send(data)
});



app.get('/myListedNFTs/:address', async (req,res)=> {
    const data = (await myListedNFTs(req.params.address));
    res.send(data)
});



app.get('/', async (req,res)=> {
    const data = (await allNFTs());
    res.send(data)
});




app.listen(4000, ()=> {
    console.log(`Server started on PORT ${4000}`)
});