// Import the fs module to handle file system operations.
const fs = require('fs');
const path = require('path');

// Define the Data class to structure the student and course data.
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

// Declare a variable to hold the data collection once it's initialized.
let dataCollection = null;

// Paths to JSON files. Using /tmp for Vercel's writable directory for students.
const studentsPath = path.join('/tmp', 'students.json');
const coursesPath = path.join(__dirname, '../data', 'courses.json');

// Function to initialize the data collection by reading and parsing JSON files.
function initialize() {
    return new Promise((resolve, reject) => {
        // Check if students.json exists in /tmp. If not, copy from initial location.
        if (!fs.existsSync(studentsPath)) {
            fs.copyFile(path.join(__dirname, '../data', 'students.json'), studentsPath, (err) => {
                if (err) return reject("Error copying students.json file");
                readDataFiles();
            });
        } else {
            readDataFiles();
        }

        // Function to read data files and set up the data collection.
        function readDataFiles() {
            // Read the students.json file.
            fs.readFile(studentsPath, 'utf8', (err, studentDataFromFile) => {
                if (err) {
                    return reject("unable to read students.json");
                }

                let students;
                try {
                    // Try to parse the student data.
                    students = JSON.parse(studentDataFromFile);
                } catch (parseErr) {
                    return reject("unable to parse students.json");
                }

                // Read the courses.json file.
                fs.readFile(coursesPath, 'utf8', (err, courseDataFromFile) => {
                    if (err) {
                        return reject("unable to read courses.json");
                    }

                    let courses;
                    try {
                        // Try to parse the course data.
                        courses = JSON.parse(courseDataFromFile);
                    } catch (parseErr) {
                        return reject("unable to parse courses.json");
                    }

                    // Once both files are successfully read and parsed, create a new Data object.
                    dataCollection = new Data(students, courses);
                    // Resolve the promise to indicate successful initialization.
                    resolve();
                });
            });
        }
    });
}

// Function to get all students from the data collection.
function getAllStudents() {
    return new Promise((resolve, reject) => {
        if (dataCollection && dataCollection.students.length > 0) {
            resolve(dataCollection.students);
        } else {
            reject("no results returned");
        }
    });
}

// Function to get all courses from the data collection.
function getCourses() {
    return new Promise((resolve, reject) => {
        if (dataCollection && dataCollection.courses.length > 0) {
            resolve(dataCollection.courses);
        } else {
            reject("no results returned");
        }
    });
}

// Function to get students by course from the data collection.
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        if (dataCollection) {
            const studentsByCourse = dataCollection.students.filter(student => student.course == course);
            if (studentsByCourse.length > 0) {
                resolve(studentsByCourse);
            } else {
                reject("no results returned");
            }
        } else {
            reject("no results returned");
        }
    });
}

// Function to get a student by student number from the data collection.
function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        if (dataCollection) {
            const student = dataCollection.students.find(student => student.studentNum == num);
            if (student) {
                resolve(student);
            } else {
                reject("no results returned");
            }
        } else {
            reject("no results returned");
        }
    });
}

// Add student function
function addStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        studentData.studentNum = dataCollection.students.length + 1;
        dataCollection.students.push(studentData);

        // Save the updated array to the JSON file in /tmp
        fs.writeFile(studentsPath, JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject("Error writing to students.json file");
            } else {
                resolve();
            }
        });
    });
}

// Function to get a course by course ID from the data collection.
function getCourseById(id) {
    return new Promise((resolve, reject) => {
        if (dataCollection) {
            const course = dataCollection.courses.find(course => course.courseId == id);
            if (course) {
                resolve(course);
            } else {
                reject("query returned 0 results");
            }
        } else {
            reject("no results returned");
        }
    });
}

// Update student function
function updateStudent(studentData) {
    return new Promise((resolve, reject) => {
        let index = dataCollection.students.findIndex(student => student.studentNum == studentData.studentNum);

        if (index !== -1) {
            dataCollection.students[index] = {
                ...dataCollection.students[index],
                ...studentData,
                TA: studentData.TA === 'on' // Convert 'on' to true, else false
            };

            // Write the updated data back to the JSON file in /tmp
            fs.writeFile(studentsPath, JSON.stringify(dataCollection.students, null, 2), (err) => {
                if (err) {
                    console.error("Error writing to students.json file:", err);
                    return reject("Error writing to students.json file");
                }
                resolve();
            });
        } else {
            console.error("Student not found:", studentData.studentNum);
            reject("Student not found");
        }
    });
}

// Export the functions
module.exports = {
    initialize,
    getAllStudents,
    getCourses,
    getStudentsByCourse,
    getStudentByNum,
    addStudent,
    getCourseById,
    updateStudent
};
