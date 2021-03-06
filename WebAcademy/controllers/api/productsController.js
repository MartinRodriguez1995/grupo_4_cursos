const db = require('../../database/models');
const { courseGenerator, programIdBuild } = require('../helpers/courseHelpers');

let rutaApi = "http://localhost:3000/api/products"
    ruta = "http://localhost:3000/products/detail"

module.exports = {
    list: (req, res) => {
        let totalQty = db.Course.findAll({
            attributes: ['id', 'name', 'price', 'image', 'vacancies', 'description_short']
        })

        let pageQty = req.query.pageQty ? Number(req.query.pageQty) : 10,
        start = req.query.start ? Number(req.query.start) : 0
        
        let result = db.Course.findAll({
            include: [{ association: 'category' }, { association: 'professor' }, { association: 'program' }],
            offset: start,
            limit: pageQty,
        })
        
        Promise.all([totalQty, result])
            .then(([totalQty, result]) => {
                    let next_page = null,
                    prev_page = null,
                    first_page = `${rutaApi}?start=0&pageQty=${pageQty}`;

                    
                    result.length == pageQty ? next_page = `${rutaApi}?start=${start + pageQty}&pageQty=${pageQty}` : next_page;
                    
                    if ((totalQty.length - result.length) == start) {
                        next_page = null;
                    }
                    
                    start >= pageQty ? prev_page = `${rutaApi}?start=${start - pageQty}&pageQty=${pageQty}` : prev_page;
                    
                    for (let course of result) {
                        course.setDataValue('endpoint', rutaApi + "/" +course.id);
                    }
                    
                    let lastProduct = totalQty[totalQty.length-1]
                        lastProduct.setDataValue('endpoint', ruta + "/" +lastProduct.id);

                    let courses = {
                        meta: {
                            status: 200,
                            total: totalQty.length,
                            lastProduct
                        },
                        pagination: {
                            next_page,
                            prev_page,
                            first_page,
                        },
                        data: result
                    }
                    res.json(courses);
                }
            )
            .catch(() =>
            res.status(404).json({
                status: 'error',
                code: '404',
                info: 'Product not found',
                messege: 'Bad request'
                
            }));
    },
    
    detail: (req, res) => {
        db.Course.findByPk(req.params.id, {
            include: [{ association: 'category' }, { association: 'professor' }, { association: 'program' }]
        }).then(result => {
            let course = {
                meta: {
                    status: 200,
                    url: rutaApi + "/" + result.id
                },
                data: result
            }
            res.json(course);
        }).catch(() =>
        res.status(404).json({
            status: 'error',
            code: '404',
            info: 'Product not found',
            messege: 'Bad request'
            
        }))
    },
    
    create: (req, res) => {
        let errors = true   // no se sabe si tendriamos que validarlos
        if (errors) {
            res.status(422).json(errors).end()
        } else {
            let days = req.body.days;
            let shift = req.body.shifts;
            let programID = programIdBuild(days, shift),
            courseData = courseGenerator(req.body.courseName, req.body.price, req.body.starts_date, req.body.ends_date, `/img/cursos/${req.files[0].filename}`, req.body.vacancies, req.body.outstanding, req.body.description_short, req.body.description_full, req.body.category, req.body.professor, programID);
            
            db.Course.create(courseData).then(() => {
                res.status(200).json({
                    status: "Curso creado"
                }).end()
            });
        }
    },
    
    update: (req, res) => {
        let errors = true;
        
        if (errors) {
            res.status(422).json(errors).end()
        } else {
            
            let days = req.body.days,
                shift = req.body.shifts,
                programID = programIdBuild(days, shift),
            courseData = courseGenerator(req.body.courseName, req.body.price, req.body.starts_date, req.body.ends_date, `/img/cursos/${req.files[0].filename}`, req.body.vacancies, req.body.outstanding, req.body.description_short, req.body.description_full, req.body.category, req.body.professor, programID);


            db.Course.update(courseData, {
                where: {
                    id: req.params.id
                }
            })
            .then(() => {
                res.status(200).json({
                    status: "Curso actualizado"
                }).end()
            });
        };
    },
    
    delete: (req, res) => {
        db.UserCourse.destroy({
            where: {
                courses_id: req.params.id
            }
        })
        .then(() => {
            db.Course.destroy({
                where: {
                    id: req.params.id
                }
            })
            .then(() => {
                res.status(200).json({
                    status: "Curso eliminado"
                }).end()
            })
        });
    }
};