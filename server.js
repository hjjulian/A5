/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Hannah Joy Julian Student ID: hjjulian - 152589230 Date: July 26, 2024
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var exphbs = require('express-handlebars');
var path = require("path");
const { initialize } = require("./modules/collegeData");
var collegeData = require("./modules/collegeData");

var app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.static(__dirname + "/public/"));
app.set('views', path.join(__dirname, 'views'));

// Setup Handlebars with custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


// This is a middleware function to set the activeRoute property in app.locals
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});


// Add body-parser middleware
app.use(express.urlencoded({ extended: true }));

// GET /students
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then(data => {
                res.render("students", { students: data });
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    } else {
        collegeData.getAllStudents()
            .then(data => {
                res.render("students", { students: data });
            })
            .catch(err => {
                res.render("students", { message: "no results" });
            });
    }
});


// GET /courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.render("courses", { courses: data });
        })
        .catch(err => {
            res.render("courses", { message: "no results" });
        });
});

// GET /
app.get("/", (req, res) => {
    res.render('home');
});

// GET /about
app.get("/about", (req, res) => {
    res.render('about');
});

// GET /htmlDemo
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

// GET /students/add
app.get("/students/add", (req, res) => {
    res.render('addStudent');
});

// POST /students/add
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to add student");
        });
});

// GET /course/:id
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(data => {
            res.render("course", { course: data });
        })
        .catch(err => {
            res.status(404).send("Course not found");
        });
});

// GET /student/:studentNum
app.get("/student/:studentNum", (req, res) => {
    collegeData.getStudentByNum(req.params.studentNum)
        .then(data => {
            res.render("student", { student: data });
        })
        .catch(err => {
            res.status(404).send("Student not found");
        });
});

// POST /student/update
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
});

// 404 Error
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

// Initialize and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("server listening on port: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.log("Unable to start server: " + err);
    });

module.exports = app;