var express =require('express')
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
const user_route = require('./api_drivers/borrow_box_users')
const inventory_route = require('./api_drivers/borrow_box_inventory').router
app.use(express.static('public'))
app.use('/u_image',express.static(__dirname +'/user_image_uploads'))
app.use(express.json());       // to support JSON-encoded bodies
 // to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/api/users',user_route)
app.use('/api/inventory/',inventory_route)

app.get('/',function(req,res){
    res.sendFile(__dirname+'/views/home.html')

})
app.get('/user',function(req,res){
    res.sendFile(__dirname+'/views/dashboard.html')
})
app.get('/api/*',function(req,res){
    res.sendStatus(404)
})

app.listen(3000)