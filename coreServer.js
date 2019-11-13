var express =require('express')
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
var session = []
const user_route = require('./api_drivers/borrow_box_users').router
const inventory_route = require('./api_drivers/borrow_box_inventory').router
const general_route = require('./api_drivers/general_drivers').router
const auth_route = require('./auth/authHandler').router
app.use('/static',express.static('public'))
app.use('/u_image',express.static(__dirname +'/user_image_uploads'))
app.use(express.json());       // to support JSON-encoded bodies
 // to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use('/api/users',user_route)
app.use('/api/inventory/',inventory_route)
app.use('/api/home/',general_route)
app.use('/api/auth/',auth_route)
app.get('/',function(req,res){
    res.sendFile(__dirname+'/views/home.html')

})
app.get('/dashboard',function(req,res){
    res.sendFile(__dirname+'/views/dashboard.html')
})
app.get('/api/*',function(req,res){
    res.sendStatus(404)
})

app.listen(3000)