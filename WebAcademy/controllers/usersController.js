const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { check, validationResult, body } = require('express-validator');
const db = require('../database/models');

const usersController = {
    register: (req, res) => {
        db.Category.findAll({
            include: {association: 'courses'}
        })
            .then(categories => {
                res.render('register', {categories, loggedInUser: req.session.loggedIn});
            });
    },
    create: (req, res) => {
        db.Category.findAll({
            include: {association: 'courses'}
        })
            .then(categories => {
                let errors = validationResult(req);
                if(!errors.isEmpty()) {
                    res.render('register', {errors: errors.errors, categories, loggedInUser: req.session.loggedIn});
                } else {
                    let user;
                    if(req.files[0] != undefined){ // si hay avatar
                        user = {
                            name: req.body.name,
                            email: req.body.email,
                            password: bcrypt.hashSync(req.body.password, 10),
                            avatar: `/img/users/${req.files[0].filename}`,
                        }
                    } else { // si no hay avatar
                        user = {
                            name: req.body.name,
                            email: req.body.email,
                            password: bcrypt.hashSync(req.body.password, 10),
                        }
                    }
                    
                    db.User.create(user);
            
                    req.session.loggedIn = user;
                    res.cookie('remember', user.email, { maxAge: 6000000 })
            
                    res.redirect('/users');
                }
            });
    },
    login: (req, res) => {
        db.Category.findAll({
            include: {association: 'courses'}
        })
            .then(categories => {
                res.render('login', {categories, loggedInUser: req.session.loggedIn});
            });
    },
    processLogin: (req, res) => {
        let categories = db.Category.findAll({
            include: {association: 'courses'}
        })
        let user = db.User.findOne({where: {email: req.body.email}});

        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.render('login', {errors: errors.errors, loggedInUser: {name:'Iniciar Sesión'}, categories});
        } else {
            Promise.all([categories, user])
            .then(([categories, user]) => {
                let loginUser = user;
                if ((loginUser != null && bcrypt.compareSync(req.body.password, loginUser.password)) || (loginUser != null && req.body.password === loginUser.password)) { 
                // en la database tenemos contraseñas no encriptadas, por eso tengo que verificar tambien sin el bcrypt, en un futuro seria solo con bcrypt.
                    
                    req.session.loggedIn = loginUser;
                    loggedInUser = req.session.loggedIn

                    if(req.body.remember != undefined) {
                        res.cookie('remember', loginUser.email, { maxAge: 6000000 })
                    }

                    res.render('users', {categories, loggedInUser: req.session.loggedIn});
                } else {
                    req.session.destroy();
                    res.clearCookie('remember');
                    res.render('login', {errors: [
                        {msg: 'Credenciales inválidas'}
                    ], loggedInUser: {name:'Iniciar Sesión'}, categories});
                }
            });
        }
    },
    logout: (req, res) => {
        req.session.destroy();
        res.clearCookie('remember');
        res.redirect('/users/login');
    },
    users: (req, res) => {
        db.Category.findAll({
            include: {association: 'courses'}
        })
            .then(categories => {
                res.render('users', {categories, loggedInUser: req.session.loggedIn});
            });
    },
    edit: (req, res) => {
        let categories = db.Category.findAll({
            include: {association: 'courses'}
        })
        let user = db.User.findOne({where: {email: req.params.email}});

        Promise.all([categories, user])
            .then(([categories, user]) => {
                res.render('editProfile', {user:user, loggedInUser: req.session.loggedIn, categories});
            });
    },
    update: (req, res) => {
        let user;
        if(req.files[0] != undefined){
            user = {
                name: req.body.name,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                avatar: `/img/users/${req.files[0].filename}`,
            }
        } else {
            user = {
                name: req.body.name,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
            }
        }
        
        db.User.update(user, {
            where: {
                email: req.params.email
            }
        })
            .then(() => {
                // primero limpio la cookie anterior por si se edito el mail, despues creo la nueva
                res.clearCookie('remember');
                req.session.loggedIn = user;
                if(req.body.remember != undefined) {
                    res.cookie('remember', req.session.loggedIn.email, { maxAge: 6000000 })
                }

                res.redirect(`/users`);
            })
    }
}

module.exports = usersController;