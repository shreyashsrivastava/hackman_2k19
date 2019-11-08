var mongoose = require('mongoose')
var express = require('express')
var async = require("async");
var promise = require('promise')
const _inventory = require('./borrow_box_inventory')
var router = express.Router()
const cryptoRandomString = require('crypto-random-string');
var multer = require('multer')
var img_dest = multer({
    dest: 'user_image_uploads/'
})
mongoose.set('debug', true);
const _schema = mongoose.Schema({
    U_name: {
        type: String,
        required: true,
        unique: true
    },
    U_pass: String,
    U_profile_pic: Array,
    User_box: Array,
    request_list: Array,
    request_box_list: Array,
    User_box_sync: Boolean,
    User_lend_box: Array
}, {
    collection: 'users'
})
const _users = mongoose.model('users', _schema);
mongoose.connect('mongodb://localhost:5000/borrow_box_users', {
    useNewUrlParser: true
})

function hashId(s) {
    return s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
    }, 0);
}

function create_data(req) {
    var _udata = null
    const id = hashId(req.body._prodname) + hashId(req.body._category)
    _udata = {
        prod_id: id,
        prod_name: req.body._prodname,
        prod_img: [req.file.path],
        prod_desc: req.body._desc,
        prod_category: req.body._category,
        prod_rating: req.body._rating,
        prod_man: req.body._manufacturer,
        prod_yop: req.body._yop,
        By_User: req.params._uname,
        Status: 0,
        Lended_by: null,
        Expiry_date: null,
        lend_date: null
    }
    return _udata
}

function create_request_data(req) {



    return _inventory.db.find({
        prod_id: req.body._prodId
    }, function (err, data) {
        console.log(data)
        if (err || data == null) {
            console.log(err)
        } else {

            _data = {
                req_id: cryptoRandomString({
                    length: 10
                }),
                req_prod_id: req.body._prodId,
                req_prod_name: req.body._prodname,
                req_date: Date.now(),
                req_by_user: req.params._uname,
                req_prod_user: data[0].By_User,
                req_prod_params: {
                    Expiry_date: req.body._ExpDate,
                    lend_approve_date: null,
                    _comments: req.params._comments
                }
            }
            return _data
        }

    })


}
router.get('/:_uname/:_sid/_borrow_box', function (req, res) {
    console.log(req.body)
    _users.find({
        U_name: req.params._uname
    }).exec(function (err, data) {
        if (err) res.send(err)

        res.send(data[0].User_box);
    })
})
router.post('/:_uname/:_sid/add_to_box', img_dest.single('prod_image'), function (req, res) {
    var _udata = create_data(req);
    console.log(_udata)
    _users.findOne({
        U_name: req.params._uname
    }).exec(function (err, data) {
        var u_temp = data;
        data.User_box.push(_udata);
        _users.findOneAndUpdate({
            U_name: req.params._uname
        }, {
            User_box: data.User_box
        }, {
            new: true
        }).exec(function (err, data) {
            if (err) res.send({
                res_code: 500,
                res_data: err
            })
            _inventory.add_to_db(_udata, function (data) {
                res.send({
                    res_code: 200,
                    res_data: data
                })
            })

        })
    })
})
router.get('/:_uname/:_sid/_get_request_list', function (req, res) {
    _users.findOne({
        U_name: req.params._uname
    }).exec(function (err, data) {
        if (err) res.end(err)
        res.send(data.request_list)
    })
})

router.post('/:_uname/:_sid/make_a_request', function (req, res) {

    _data = create_request_data(req)

    if (_data == null) {
        res.sendStatus(404)
    } else {
        console.log(_data)
        _users.findOne({
            U_name: req.params._uname
        }).exec(function (err, data) {
            data.request_list.push(_data);
            _users.findOneAndUpdate({
                U_name: req.params._uname
            }, {
                request_list: data.request_list
            }, {
                new: true
            }).exec(function (err, data) {
                if (err) res.send({
                    res_code: 500,
                    res_data: err
                })
                _users.findOne({
                    U_name: _data.req_prod_user
                }).exec(function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    data.request_box_list.push(_data);
                    _users.findOneAndUpdate({
                        U_name: _data.req_prod_user
                    }, {
                        request_box_list: data.request_box_list
                    }, {
                        new: true
                    }).exec(function (err, data) {
                        if (err) res.send({
                            res_code: 500,
                            res_data: err
                        })
                        res.send('okay')

                    })
                })

            })
        })
    }
})
router.get('/:_uname/:_sid/get_my_request_list', function (req, res) {
    _users.findOne({
        U_name: req.params._uname
    }).exec(function (err, data) {
        var request_list = data.request_list
        res.send(request_list)
    })
})
router.get('/:_uname/:_sid/my_box_request_list', function (req, res) {
    _users.findOne({
        U_name: req.params._uname
    }).exec(function (err, data) {
        var request_box_list = data.request_box_list
        res.send(request_box_list)
    })
})
router.post('/:_uname/:_sid/approve_request', function (req, res) {
    _users.findOne({
        U_name: req.params._uname
    }).exec(function (err, data) {
        const request_id = req.body._request_id;
        const lended_till = req.body._lended_till;
        var request_prod_id;
        var request_obj;
        var remove_arr;
        var arr = data.request_box_list;

        async.forEachOf(arr, (element, i) => {
            if (element.req_id == request_id) {
                request_prod_id = element.req_prod_id
               remove_arr = i;
                request_obj = element
            } else {

            }

        })
        arr.splice(remove_arr,1);
        console.log(request_obj)
        var _lendObj = {
            _req: request_obj,
            Exp_date: lended_till
        }
        var arr = data.User_box;
        arr.forEach(function (val, i) {
            if (request_prod_id == val.prod_id) {
                data.User_box[i].Lended_by = request_obj.req_by_user
                data.User_box[i].lend_date = lended_till
            }
            else{request_obj = null}
        })
        _users.findOneAndUpdate({
            U_name: req.params._uname
        }, {
            User_box: data.User_box,
            request_box_list: data.request_box_list
        }, {
            new: true
        }).exec(function (err, data) {
            if (err) res.sendStatus(500)
            console.log(request_obj)
            _users.findOne({
                U_name: request_obj.req_by_user
            }).exec(function (err, data) {
                if (err) res.send({
                    code: "err",
                    err: err
                })
                data.User_lend_box.push(_lendObj)
                _users.findOneAndUpdate({
                    U_name: request_obj.req_by_user
                }, {
                    User_lend_box: data.User_lend_box
                }, {
                    new: true
                }).exec(function (err, data) {
                    if (err) res.send({
                        code: "err",
                        err: err
                    })
                    _inventory.findOneAndUpdate({prod_id: request_prod_id},{Status: 1,Lended_by:request_obj.req_by_user,
                        Expiry_date: lended_till,
                        lend_date: Date.now()}).exec(function(err,data){
                            if (err) res.send({
                                code: "err",
                                err: err
                            })
                            res.sendStatus(200)
                        })
                })
            })
        })
    })
})
router.get('/*', function (req, res) {
    res.sendStatus(404)
})
module.exports = router