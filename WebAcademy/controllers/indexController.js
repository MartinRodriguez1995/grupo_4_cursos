const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { check, validationResult, body } = require('express-validator');

const tips = require('../data/tipsDataBase.json');
const products = require('../data/products.json');
const categories = require('../data/categoriesDataBase.json');
const outstandingProducts = products.filter(product => {
    return product.outstanding == "true";
});

const indexController = {
    index: (req, res) => {
        res.render('index', {products, outstandingProducts, categories, tips, loggedInUser: req.session.loggedIn});
    },
    register: (req, res) => {
        res.render('register', {loggedInUser: req.session.loggedIn});
    },
    create: (req, res) => {
        let user = {
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            avatar: req.files[0].filename
        }
        
        let usersDataBase = fs.readFileSync(path.join(__dirname, "..", "data", "users.json"), {encoding:'UTF-8'});

        let users;
        if (usersDataBase == ""){
            users = [];
        } else {
            users = JSON.parse(usersDataBase);
        }

        users.push(user);
        
        usersJSON = JSON.stringify(users);

        fs.writeFileSync(path.join(__dirname, "..", "data", "users.json"), usersJSON);

        req.session.loggedIn = user;
        res.cookie('remember', user.email, { maxAge: 6000000 })

        res.redirect('/users');
    },
    login: (req, res) => {
        res.render('login', {loggedInUser: req.session.loggedIn})
    },
    processLogin: (req, res) => {
        let usersDataBase = fs.readFileSync(path.join(__dirname, "..", "data", "users.json"), {encoding:'UTF-8'});

        let users;
        if (usersDataBase == ""){
            users = [];
        } else {
            users = JSON.parse(usersDataBase);
        }
        
        let loginUser;
        for(let i = 0; i < users.length; i++) {
            if(users[i].email == req.body.email) {
                if(bcrypt.compareSync(req.body.password, users[i].password)) {
                    loginUser = users[i];
                    break;
                }
            }
        }
        
        if(loginUser == undefined) {
            return res.render('login', {errors: [
                {msg: 'Credenciales inválidas'}
            ]});
        }
        
        // Creo la session
        req.session.loggedIn = loginUser;
        loggedInUser = req.session.loggedIn

        if(req.body.remember != undefined) {
            res.cookie('remember', loginUser.email, { maxAge: 6000000 })
        }

        res.redirect('/users');

    },
    logout: (req, res) => {
        req.session.destroy(); // borra session
        res.clearCookie('remember'); // borra cookies
        res.redirect('/login');
    },
    users: (req, res) => {
        res.render('users', {loggedInUser: req.session.loggedIn});
    },
    shoppingCart: (req, res) => {
        res.render('shoppingCart', {loggedInUser: req.session.loggedIn})
    }
}

module.exports = indexController;