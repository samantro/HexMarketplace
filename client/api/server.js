const express = require('express');
const bodyParser = require('body-parser')
const {listedNFTs} = require('./listedNFTs.js')
const {myListedNFTs} = require('./myListedNFTs.js')
const {allNFTs} = require('./allNFTs.js')
const {listNFTForSale} = require('./listNFTForSale.js')
// const {accounts} = require('../pages/accounts.js')
// const Web3 = require('web3');
const app = express();

const testData = {
    price: "0.0000000004",
    name:"dog",
    description: "Dogs are honest homoside pets.",
    imageLink: "https://cdn.pixabay.com/photo/2016/02/19/15/46/labrador-retriever-1210559__480.jpg"
  }
// middlewares 
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:3000");
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.urlencoded({extended: false}) );
app.use(express.json());

const doc = '0xca891C5AFAb66BB9Fb9AFA1840443477Bc81bd88';
// accept by routers
app.use('/listedNFTs', async (req,res)=> {
    
    const data = (await listedNFTs(doc));
    res.send(data)
});
app.use('/myListedNFTs', async (req,res)=> {
    
    const data = (await myListedNFTs(doc));
    res.send(data)
});
app.use('/createNFTs', async (req,res)=> {
    const data = (await listNFTForSale(doc,testData));
    res.send(data)
});
app.use('/allNFTs', async (req,res)=> {
    // const doc = await accounts();
    const data = (await allNFTs(doc));
    res.send(data)
});

app.use('/', async (req,res)=> {
    // const doc = await accounts();
    console.log(doc);
    res.send(doc)
});

app.listen(4000, ()=> {
    console.log(`Server started on PORT ${4000}`)
});