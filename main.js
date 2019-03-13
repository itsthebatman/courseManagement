var express = require('express');
const Joi = require('joi');
var app = express();
app.set('views','./html');
app.set('view engine', 'pug');
var current = -1;									//to track current user
var current_id = -1;
var admin = 0;

class Student{										//Student class
	constructor(id, name, pass, courseList){
		this.s_id = id;
		this.s_name = name;
		this.pass = pass;
		this.courseList = courseList;
	}
}

class Course{										//Course Class
	constructor(name, status, studentList){
		this.c_name = name;
		this.status = status;
		this.studentList = studentList;
	}
}

var students = [];									//Initialization of student objects
students.push(new Student('101', "Ajay", "aj123", []));
students.push(new Student('102', "Vijay", "vi123", []));
students.push(new Student('103', "Akash", "ak123", []));
students.push(new Student('104', "Vikas", "vi123", []));
students.push(new Student('105', "Harsh", "ha123", []));
students.push(new Student('106', "Harshit", "ha123", []));
students.push(new Student('107', "Harshita", "ha123", []));
students.push(new Student('108', "Jaya", "ja123", []));
students.push(new Student('109', "Rekha", "re123", []));
students.push(new Student('110', "Sushma", "su123", []));

var courses = {};									//Initialization of course objects
courses[1001] = new Course("Java", "Inactive", [])
courses[1002] = new Course("C", "Inactive", []);
courses[1003] = new Course("C++", "Inactive", []);
courses[1004] = new Course("Python", "Inactive", []);
courses[1005] = new Course("JS", "Inactive", []);
courses[1006] = new Course("English", "Inactive", []);
courses[1007] = new Course("Hindi", "Inactive", []);
courses[1008] = new Course("French", "Inactive", []);
courses[1009] = new Course("German", "Inactive", []);
courses[1010] = new Course("Japanese", "Inactive", []);

// ------------------------------------------------------------------------------------------------

app.get('/index', (req, res)=>{							//Index Page of the system
	admin = 0;
	res.render('index');
});

app.use(express.urlencoded({extended: true}));

app.get('/stud_log', (req, res)=>{						//Student Login Page
	admin = 0;
	res.render('stud_log');
});

app.use('/stud_home', (req, res, next)=>{				//Middleware to confirm the credentials
	console.log(req.body);
	var flag = 0;
	var i = 0;
	for(i; i<students.length; i++){
		if(req.body.sid == students[i].s_id){
			current = i;
			current_id = students[i].s_id;
			flag = 1;
			break;
		}
	}
	console.log(req.body.pass+' '+current);
	if(flag == 1 && (req.body.pass == students[current].pass))
		next();
	else if(req.method == 'GET' && current != -1)
		next();
	else{
		current = -1; current_id = -1;
		res.status(401).send("Invalid username/password");
	}
});

app.get('/stud_home', (req, res)=>{
	res.render('stud_home', {
		StName: students[current].s_name
	});
});

app.post('/stud_home', (req, res)=>{					//Student Home Page
	res.render('stud_home', {
		StName: students[current].s_name
	});
});

app.get('/view', (req, res)=>{							//View Courses
	var list = [];
	if(students[current].courseList.length == 0)
		list.push("No Courses Registered");
	for(var j = 0; j<students[current].courseList.length; j++){
		list.push(courses[students[current].courseList[j]].c_name+": "+
			courses[students[current].courseList[j]].status);
	}
	res.render('studentCourse_view', {
		cList: list
	});
});

app.get('/enroll', (req,res)=>{							//Enroll in a course
	var cList = [];
	for(var key in courses){
		if(courses[key].studentList.indexOf(students[current].s_id) < 0 &&
			courses[key].status != 'Active')
			cList.push(" "+key+": "+courses[key].c_name+"\n");
	}
	if(cList.length == 0)
		cList.push("You can't enroll for any course at the moment");
	res.render('stud_enroll', {
		list: cList
	});
});

app.post('/enroll', (req, res)=>{
	if(students[current].courseList.indexOf(req.body.c_id) >= 0)
		res.send("Already enrolled for the course");
	else if(courses[req.body.c_id] == null)
		res.send("Enter a valid course code");
	else if(courses[req.body.c_id].status == "Active")
		res.send("Course has already started");
	else{
		students[current].courseList.push(req.body.c_id);
		courses[req.body.c_id].studentList.push(current_id);
		res.send("Enrolled Successfully");
	}
});

app.get('/unenroll', (req, res)=>{						//Unenroll out of a course
	var cList = [];
	for(var i = 0; i<students[current].courseList.length; i++){
		var iter = students[current].courseList[i];
		if(courses[iter].status == "Inactive")
			cList.push(" "+iter+": "+courses[iter].c_name);
	}
	if(cList.length == 0 && students[current].courseList.length == 0)
		cList.push("No courses registered");
	else if(cList.length == 0)
		cList.push("No Inactive Courses");
	res.render('stud_unenroll', {
		list: cList
	});
});

app.post('/unenroll', (req, res)=>{
	if(courses[req.body.c_id] == null)
		res.send("Enter a valid course code");
	else if(students[current].courseList.indexOf(req.body.c_id) <= -1)
		res.send("Not enrolled for the course");
	else if(courses[req.body.c_id].status == "Active")
		res.send("Can't unenroll. Course already started");
	else{
		var iter = students[current].courseList.indexOf(req.body.c_id);
		students[current].courseList.splice(iter, 1);
		iter = courses[req.body.c_id].studentList.indexOf(current_id);
		courses[req.body.c_id].studentList.splice(iter, 1);
		res.send("Unenrolled Successfully");
	}
});

// --------------------------------------------------------------------------------------------

app.get('/admin_log', (req, res)=>{						//Management Login Page
	admin = 0;
	res.render('admin_log');
});

app.use('/admin_home', (req, res, next)=>{				//Management Home Page Middleware
	if(req.method == 'GET' && admin == 1)				//to check credentials
		next();
	else if(req.body.aid != '007' && req.body.pass != 'bo123')
		res.status(401).send("Invalid username/password");
	else{
		admin = 1;
		next();
	}
});

app.post('/admin_home', (req, res)=>{
	res.render('admin_home');
});

app.get('/admin_home', (req, res)=>{
	res.render('admin_home');
});

app.get('/add', (req, res)=>{							//Add a new course page
	res.render('admin_add');
});

const schema1 = Joi.object({							//Form data validation schema
	c_id: Joi.string().length(4).regex(/^[0-9]+$/).required(),
	c_name: Joi.string().min(1).regex(/^[A-Za-z]+$/).required(),
});

app.post('/add', (req, res)=>{							//Validation
	var result = Joi.validate(req.body, schema1);
	if(result.error){
		res.status(400).send(result.error.details[0].message);
		return;
	}
	else if(courses[req.body.c_id] != null)
		res.send("Course already exists");
	else{
		courses[req.body.c_id] = new Course(req.body.c_name, "Inactive", []);
		res.send("Course Added Successfully");
	}
});

app.get('/delete', (req, res)=>{						//Delete an existing course
	var cList = [];
	for(var key in courses){
		if(courses[key].status == "Inactive")
			cList.push(" "+key+": "+courses[key].c_name);
	}
	if(cList.length == 0)
		cList.push("No courses/All courses active");
	res.render('admin_del', {
		list: cList
	});
});

app.post('/delete', (req, res)=>{
	if(courses[req.body.c_id] == null)
		res.status(404).send("Invalid Course Code");
	else if(courses[req.body.c_id].status == "Active")	//If the course is already active
		res.send("Course has already started");			//you can't delete it
	else{
		delete courses[req.body.c_id];
		for(var i = 0; i<students.length; i++){
			var iter = students[i].courseList.indexOf(req.body.c_id);
			if(iter != null)
				students[i].courseList.splice(iter, 1);
		}
		res.send("Course deleted successfully");
	}
});

app.get('/edit', (req, res)=>{							//Edit course details
	res.render('admin_edit');
});
	
app.get('/edit_stat', (req, res)=>{						//Edit course status
	var cList = [];
	for(var key in courses){
		cList.push(" "+key+": "+courses[key].status);
	}
	res.render('admin_editStat', {
		list: cList
	});
});

app.post('/edit_stat', (req, res)=>{
	if(courses[req.body.c_id] == null)
		res.status(404).send("Enter valid course code");
	else if(courses[req.body.c_id].status == "Inactive"){
		if(courses[req.body.c_id].studentList.length >= 5){
			courses[req.body.c_id].status = "Active";
			res.send("Status Changed to Active");
		}
		else
			res.send("Can't change course status. Less than 5 students");
		
	}
	else{
		courses[req.body.c_id].status = "Inactive";
		res.send("Status Changed to Inactive");
	}
});

app.get('/edit_det', (req, res)=>{						//Edit course details
	res.render('admin_editDet');
});

const schema2 = Joi.object({							//Validation schema for form data
	c_id: Joi.string().length(4).required(),
	c_name: Joi.string().min(1).regex(/^[A-Za-z]+$/).required(),
	status: Joi.string().max(8).regex(/\b(Active|Inactive)\b/).required()
});

app.post('/edit_det', (req, res)=>{						//Form data validation
	var result = Joi.validate(req.body, schema2);
	if(result.error){
		res.status(400).send(result.error.details[0].message);
		return;
	}
	else if(courses[req.body.c_id] == null)
		res.send("Invalid course code");
	else{
		courses[req.body.c_id].c_name = req.body.c_name;
		courses[req.body.c_id].status = req.body.status;
		res.send("Course details changed successfully");
	}
});
app.get('/view_all', (req, res)=>{						//View all courses
	var cList = [];
	for(var key in courses)
		cList.push(" "+key+": "+courses[key].c_name+"; "+courses[key].status);
	res.render('admin_view', {
		list: cList
	});
});


app.get('/change/:c_id', (req, res)=>{					//Change course status using headers and
														//parameters 
	if(req.headers.aid != "007" || req.headers.pass!= "bo123")
		res.status(401).send('Invalid username/password');
	else if(courses[req.params.c_id] == null)
		res.status(404).send("No such course found");
	else if(courses[req.params.c_id].status == "Inactive"){
		if(courses[req.params.c_id].studentList.length >= 5){
			courses[req.params.c_id].status = "Active";
			res.send("Status Changed to Active");
		}
		else
			res.send("Can't change course status. Less than 5 students");
	}
	else{
		courses[req.params.c_id].status = "Inactive";
		res.send("Status Changed to Inactive");
	}

});
app.listen(3000);