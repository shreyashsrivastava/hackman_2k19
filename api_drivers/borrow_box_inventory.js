var mongoose = require('mongoose')
var express = require('express')
var async = require('async')
var router = express.Router()
var _Obj = mongoose.Schema({
    prod_id: {
        type: String,
        unique: true,
        required: true
    },
    prod_name: String,
    prod_img: Array,
    prod_desc: String,
    prod_rating: Number,
    prod_category: String,
    prod_man: String,
    prod_yop: String,
    By_User: String,
    Status: Boolean,
    Lended_by: String,
    Expiry_date:Date,
    lend_date: Date
}, {
    collection: "borrow_box_inventory"
})

var _inventory = mongoose.model('_inventory', _Obj)
mongoose.connect('mongodb://localhost:5000/borrow_box', {
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

router.get('/borrow/:_category', function (req, res) {
    console.log('okay')
    _inventory.find({
        prod_category: req.params._category,
        Lended_by: null
    },'prod_name prod_img prod_desc prod_desc').exec(function (err, data) {
        console.log(data)
        res.send(data)
    })
})
router.get('/info/:_id', function (req, res) {
    _inventory.find({
        prod_id: req.params._id
    }).exec(function (err, data) {
        res.send(data)
    })
})
router.get('/search/:_prodName', function (req, res) {
    _inventory.find({
        prod_name: req.params._prodName
    }).exec(function (err, data) {
        res.send(data)
    })
})








module.exports.add_to_db = function (data, callback) {
    var temp = new _inventory(data);
    temp.save().then(() => callback('okay'))
}
module.exports.db = _inventory
module.exports.router = router