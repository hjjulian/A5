const fs = require("fs");

// Define the Data class to store students and courses data
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

// Function to initialize data by reading JSON files
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        // Read the courses JSON file
        fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses");
                return;
            }

            // Read the students JSON file
            fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students");
                    return;
                }

                // Parse the JSON data and initialize the Data object
                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

// Function to get all students
module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length === 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(dataCollection.students);
    });
}

// Function to get all TAs
module.exports.getTAs = function () {
    return new Promise((resolve, reject) => {
        const filteredStudents = dataCollection.students.filter(student => student.TA);

        if (filteredStudents.length === 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(filteredStudents);
    });
};

// Function to get all courses
module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length === 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(dataCollection.courses);
    });
};

// Function to get a student by student number
module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        const foundStudent = dataCollection.students.find(student => student.studentNum == num);

        if (!foundStudent) {
            reject("query returned 0 results");
            return;
        }

        resolve(foundStudent);
    });
};

// Function to get students by course
module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        const filteredStudents = dataCollection.students.filter(student => student.course == course);

        if (filteredStudents.length === 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(filteredStudents);
    });
};

// Function to get a course by ID
module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        const foundCourse = dataCollection.courses.find(course => course.courseId == id);

        if (!foundCourse) {
            reject("query returned 0 results");
            return;
        }

        resolve(foundCourse);
    });
};

// Function to update student information
module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        const index = dataCollection.students.findIndex(student => student.studentNum == studentData.studentNum);

        if (index === -1) {
            reject("No student found with the given studentNum");
            return;
        }

        // Update the student record
        dataCollection.students[index] = {
            ...dataCollection.students[index],
            ...studentData,
            TA: studentData.TA === 'on' // Convert checkbox value to boolean
        };

        resolve();
    });
};
