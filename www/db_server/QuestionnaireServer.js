// Anna Jolly - Oct. 16, 2017

// http://sgeek.org/create-restful-api-using-node-js-express-and-mysql/

// ------------------------------------
// SETUP
// ------------------------------------

var http   = require('http'),
    q        = require('q'),
    express  = require('express'),
    mysql    = require('mysql')
parser   = require('body-parser');

// var connection = mysql.createConnection({
//   host     : 'qr0.ca',
//   user     : 'qr0',
//   password : '',
//   database : 'qr0_questionnaires'
// });

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'QuestionnaireDB_StringKeys'
});

try {
    connection.connect();
}
catch(e) {
    console.log('Database Connection failed:' + e);
}

var app = express();
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, postman-token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, postman-token');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
app.set('port', process.env.PORT || 5000);

// ------------------------------------
// TEST CONNECTION
// ------------------------------------

app.post('/', function (req, res) {
    res.send('<html><body><p>Works</p></body></html>');
});


// ------------------------------------
// GET QUESTION_BANK
// ------------------------------------

var lang = 'en';

var qb_answeroptions = {
    get:function(questiontype_ser_num) {
        var r = q.defer();
        // var aos = [];
        connection.query('SELECT ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE text_key = qs.string_key AND qs.language = ?) AS text, (SELECT qs.string FROM questionnaire_strings qs WHERE caption_key = qs.string_key AND qs.language = ?) AS caption, position, created_by FROM `question_bank_answeroption` WHERE questiontype_ser_num = ?;', [lang, lang, questiontype_ser_num], function(ao_err, ao_rows, ao_fields) {
            if (!ao_err) {
                var aos = [];
                ao_rows.forEach(function(ao_row) {
                    var answeroption = {
                        ser_num   : ao_row["ser_num"],
                        text      : ao_row["text"],
                        caption   : ao_row["caption"],
                        position  : ao_row["position"],
                        created_by: ao_row["created_by"]
                    };
                    aos.push(answeroption);
                });
                r.resolve(aos);
            }
            else {
                r.reject(ao_err);
            }
        });
        return r.promise;
    }
};

function qb_populateQuestion(qs,ques_row,callback) {
    qb_answeroptions.get(ques_row["questiontype_ser_num"]).then(function(response) {
        var question = {
            ser_num      : ques_row["ser_num"],
            text         : ques_row["text"],
            qt_name      : ques_row["name"],
            qt_category  : ques_row["category"],
            created_by   : ques_row["created_by"],
            answeroptions: response
        };
        qs.push(question);
        callback();
    });
}

var qb_ques_loop = function(r, j, qs, ques_rows) {
    qb_populateQuestion(qs, ques_rows[j], function(){
        j++;
        if(j < ques_rows.length) {
            qb_ques_loop(r, j, qs, ques_rows);
        }
        else {
            r.resolve(qs);
        }
    });
}

var qb_questions = {
    get:function(library_ser_num) {
        var r = q.defer();
        connection.query('SELECT q.ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE q.text_key = qs.string_key AND qs.language = ?) AS text, q.created_by, q.questiontype_ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE qt.name_key = qs.string_key AND qs.language = ?) AS name, (SELECT qs.string FROM questionnaire_strings qs WHERE qt.category_key = qs.string_key AND qs.language = ?) AS category FROM `question_bank_question` q JOIN `question_bank_questiontype` qt ON q.questiontype_ser_num = qt.ser_num WHERE q.library_ser_num = ?;', [lang, lang, lang, library_ser_num], function(ques_err, ques_rows, ques_fields) {
            if (!ques_err) {
                var qs = [];
                var j = 0;
                qb_ques_loop(r, j, qs, ques_rows);
            }
            else {
                r.reject(ques_err);
            }
        });
        return r.promise;
    }
};

function qb_populateLibrary(libs,row,callback) {
    qb_questions.get(row["ser_num"]).then(function(response) {
        var library = {
            ser_num   : row["ser_num"],
            name      : row["name"],
            private   : row["private"],
            created_by: row["created_by"],
            questions : response
        };
        libs.push(library);
        callback();
    });
}

var qb_lib_loop = function(r, i, libs, lib_rows) {
    qb_populateLibrary(libs, lib_rows[i], function(){
        i++;
        if (i < lib_rows.length) {
            qb_lib_loop(r, i, libs, lib_rows);
        }
        else {
            r.resolve(libs);
        }
    });
}

var qb_libraries = {
    get:function() {
        var r = q.defer();
        //var libs = [];
        connection.query('SELECT ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE name_key = qs.string_key AND qs.language = ?) AS name, private, created_by from question_bank_library;', [lang],  function(lib_err, lib_rows, lib_fields) {
            if (!lib_err) {
                var libs = [];
                var i = 0;
                qb_lib_loop(r, i, libs, lib_rows);
            }
            else {
                r.reject(lib_err);
            }
        });
        return r.promise;
    }
};

app.post('/questionbank/', function (req,res) {
    if ( typeof req.body.language !== 'undefined') {
        lang = req.body.language;
        var resp = [];
        // https://stackoverflow.com/questions/14408718/wait-for-callback-before-continue-for-loop
        qb_libraries.get().then(function(response) {

            // TODO: process response to see if error

            resp.push({'result' : 'success', 'data' : response});
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(resp));
        });
    }
    else {
        res.status(400).send("language is a required parameter");
    }
});

// ------------------------------------
// UPDATE QUESTIONNAIRE STATUS
// ------------------------------------

var update_status = {
    get:function(qp_ser_num, new_status) {
        var r = q.defer();
        connection.query('UPDATE questionnaire_entity_patient_rel SET status = "' + new_status + '" WHERE ser_num = ?;', [qp_ser_num], function(err, result) {
            if (!err) {
                r.resolve(new_status);
            }
            else {
                r.reject(err);
            }
        });
        return r.promise;
    }
};

app.post('/update-questionnaire-status/', function (req,res) {
    if ( typeof req.body.qp_ser_num !== 'undefined' && typeof req.body.new_status !== 'undefined') {
        var qp_ser_num = req.body.qp_ser_num;
        var new_status = req.body.new_status;
        var response = [];
        update_status.get(qp_ser_num, new_status).then(function(answer) {
            response.push({'result' : 'success', 'data' : answer});
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
        });
    }
    else {
        res.status(400).send("questionnaire_patient_rel_ser_num and new_status are required parameters");
    }
});

// ------------------------------------
// SAVE ANSWER TO QUESTIONNAIRE
// ------------------------------------

var write_skipped = {
    get:function(qp_ser_num, q_ser_num) {
        var r = q.defer();
        connection.query('INSERT INTO questionnaire_answer(questionnaire_patient_rel_ser_num, question_ser_num, skipped) VALUES (?,?,1);', [qp_ser_num, q_ser_num], function(err, result) {
            if (!err) {
                r.resolve(result.insertId);
            }
            else {
                r.reject(err);
            }
        });
        return r.promise;
    }
}

var overwrite_answer = {
    get:function(qp_ser_num, q_ser_num, ao_ser_num) {
        var r = q.defer();
        if (ao_ser_num == 'SKIPPED' || ao_ser_num == -9) {
            connection.query('DELETE FROM questionnaire_answer WHERE questionnaire_patient_rel_ser_num = ? AND question_ser_num = ?;', [qp_ser_num, q_ser_num], function(err, result) {
                if (!err) {
                    write_skipped.get(qp_ser_num, q_ser_num, ao_ser_num).then(function(answer) {
                        r.resolve(answer);
                    });
                }
                else {
                    r.reject(err);
                }
            });
        }
        else {
            connection.query('UPDATE questionnaire_answer SET answeroption_ser_num = ? WHERE questionnaire_patient_rel_ser_num = ? AND question_ser_num = ?;', [ao_ser_num, qp_ser_num, q_ser_num], function(err, result) {
                if (!err) {
                    r.resolve(ao_ser_num);
                }
                else {
                    r.reject(err);
                }
            });
        }
        return r.promise;
    }
};

var save_answer = {
    get:function(qp_ser_num, q_ser_num, ao_ser_num) {
        var r = q.defer();
        if (ao_ser_num == 'SKIPPED' || ao_ser_num == -9) {
            write_skipped.get(qp_ser_num, q_ser_num, ao_ser_num).then(function(answer) {
                r.resolve(answer);
            });
        }
        else {
            connection.query('INSERT INTO questionnaire_answer(questionnaire_patient_rel_ser_num, question_ser_num, answeroption_ser_num, skipped) VALUES (?,?,?,0);', [qp_ser_num, q_ser_num, ao_ser_num], function(err, result) {
                if (!err) {
                    r.resolve(result.insertId);
                }
                else {
                    r.reject(err);
                }
            });
        }
        return r.promise;
    }
};

var check_if_answer_exists = {
    get:function(qp_ser_num, q_ser_num, ao_ser_num) {
        var r = q.defer();
        connection.query('SELECT ser_num FROM questionnaire_answer WHERE questionnaire_patient_rel_ser_num = ? AND question_ser_num = ?;', [qp_ser_num, q_ser_num], function(err, rows, fields) {
            if (!err) {
                if (rows.length > 0) {
                    overwrite_answer.get(qp_ser_num, q_ser_num, ao_ser_num).then(function(answer) {
                        r.resolve(answer);
                    });
                }
                else {
                    save_answer.get(qp_ser_num, q_ser_num, ao_ser_num).then(function(answer) {
                        r.resolve(answer);
                    });
                }
            }
            else {
                r.reject(err);
            }
        });
        return r.promise;
    }
}

app.post('/questionnaire-answer/', function (req,res) {
    if ( typeof req.body.qp_ser_num !== 'undefined' && typeof req.body.q_ser_num !== 'undefined' && typeof req.body.ao_ser_num !== 'undefined') {
        var qp_ser_num = req.body.qp_ser_num;
        var q_ser_num = req.body.q_ser_num;
        var ao_ser_num = req.body.ao_ser_num;
        var response = [];
        check_if_answer_exists.get(qp_ser_num, q_ser_num, ao_ser_num).then(function(answer) {
            response.push({'result' : 'success', 'data' : answer});
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
        });
    }
    else {
        res.status(400).send("questionnaire_patient_rel_ser_num, question_ser_num and answeroption_ser_num are required parameters");
    }
});


// ------------------------------------
// GET PATIENT'S QUESTIONNAIRES
// ------------------------------------

var patient_ser_num = -1;
var qp_ser_num      = -1; //questionnaire_entity_patient_rel ser_num

var pq_options = {
    get:function(questiontype_ser_num) {
        var r = q.defer();
        connection.query('SELECT ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE text_key = qs.string_key AND qs.language = ?) AS text, (SELECT qs.string FROM questionnaire_strings qs WHERE caption_key = qs.string_key AND qs.language = ?) AS caption, position FROM `question_bank_answeroption` WHERE questiontype_ser_num = ? ORDER BY position;', [lang, lang, questiontype_ser_num], function(err, rows, fields) {
            if (!err) {
                var options = {};
                for(var i=0; i<rows.length; i++) {
                    var row = rows[i];
                    var option_values = {
                        text    : row["text"],
                        caption : row["caption"],
                        position: row["position"]
                    }
                    var option_key = row["ser_num"];
                    options[option_key] = option_values;
                }
                r.resolve(options);
            }
            else {
                r.reject(err);
            }
        });
        return r.promise;
    }
};

function pq_populateQuestion(arr,row,callback) {
    pq_options.get(row["questiontype_ser_num"]).then(function(response) {
        // check if previous question is same as this one
        var question = {
            ser_num       : row["ser_num"],
            text          : row["text"],
            position      : row["position"],
            optional      : row["optional"],
            polarity      : row["polarity"],
            questiontype  : row["category"],
            patient_answer: [],
            options       : response
        };
        if (arr.length > 0 && arr[arr.length-1].ser_num == row["ser_num"]) {
            if (row["category"] == 'Scale') {
                arr[arr.length-1].patient_answer.push(row["answeroption_ser_num"]);
            }
            else {
                arr[arr.length-1].patient_answer.push(""+row["answeroption_ser_num"]);
            }
        }
        else {
            if (row["answeroption_ser_num"] != null) {
                if (row["category"] == 'Scale') {
                    question.patient_answer.push(row["answeroption_ser_num"]);
                }
                else {
                    question.patient_answer.push(""+row["answeroption_ser_num"]);
                }
            }
            else if (row["skipped"] == 1) {
                if (row["category"] == 'Scale') {
                    question.patient_answer.push(-9);
                }
                else {
                    question.patient_answer.push("SKIPPED");
                }
            }
            arr.push(question);
        }
        callback();
    });
}

var pq_question_loop = function(r, i, arr, rows) {
    pq_populateQuestion(arr, rows[i], function(){
        i++;
        if (i < rows.length) {
            pq_question_loop(r, i, arr, rows);
        }
        else {
            r.resolve(arr);
        }
    });
};

var pq_questions = {
    get:function(section_ser_num) {
        var r = q.defer();
        connection.query('SELECT q.ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE q.text_key = qs.string_key AND qs.language = ?) AS text, q.questiontype_ser_num, q.polarity, sq.position, sq.optional, (SELECT qs.string FROM questionnaire_strings qs WHERE qt.category_key = qs.string_key AND qs.language = ?) AS category, a.answeroption_ser_num, a.skipped FROM questionnaire_section_question_rel sq JOIN question_bank_question q ON sq.question_ser_num = q.ser_num LEFT JOIN questionnaire_answer a ON q.ser_num = a.question_ser_num AND a.questionnaire_patient_rel_ser_num = ? JOIN question_bank_questiontype qt ON q.questiontype_ser_num = qt.ser_num WHERE sq.section_ser_num = ? ORDER BY sq.position;', [lang, lang, qp_ser_num, section_ser_num], function(err, rows, fields) {
            if (!err) {
                var questions = [];
                var i = 0;
                pq_question_loop(r, i, questions, rows);
            }
            else {
                r.reject(err);
            }
        });
        return r.promise;
    }
};

function pq_populateSection(arr,row,callback) {
    pq_questions.get(row["ser_num"]).then(function(response) {
        var section = {
            ser_num     : row["ser_num"],
            title       : row["title"],
            instructions: row["instructions"],
            position    : row["position"],
            questions   : response
        };
        arr.push(section);
        callback();
    });
}

var pq_section_loop = function(r, i, arr, rows) {
    pq_populateSection(arr, rows[i], function(){
        i++;
        if (i < rows.length) {
            pq_section_loop(r, i, arr, rows);
        }
        else {
            r.resolve(arr);
        }
    });
};

var pq_sections = {
    get:function(q_ser_num) {
        var r = q.defer();
        connection.query('SELECT ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE title_key = qs.string_key AND qs.language = ?) AS title, (SELECT qs.string FROM questionnaire_strings qs WHERE instructions_key = qs.string_key AND qs.language = ?) AS instructions, position FROM questionnaire_section WHERE questionnaire_ser_num = ? ORDER BY position;', [lang, lang, q_ser_num], function(err, rows, fields) {
            if (!err) {
                var sections = [];
                var i = 0;
                pq_section_loop(r, i, sections, rows);
            }
            else {
                r.reject(err);
            }
        });
        return r.promise;
    }
};

function pq_populateQuestionnaire(arr,row,callback) {
    qp_ser_num = row["qp_ser_num"];
    pq_sections.get(row["q_ser_num"]).then(function(response) {
        var questionnaire = {
            ser_num     : row["q_ser_num"],
            qp_ser_num  : row["qp_ser_num"],
            title       : row["title"],
            nickname    : row["nickname"],
            instructions: row["instructions"],
            version     : row["version"],
            status      : row["status"],
            created     : row["created"],
            last_updated: row["last_updated"],
            sections    : response
        };
        if (questionnaire.nickname == null) {
            questionnaire.nickname = questionnaire.title;
        }
        arr.push(questionnaire);
        callback();
    });
}

var pq_main_loop = function(r, i, arr, rows) {
    pq_populateQuestionnaire(arr, rows[i], function(){
        i++;
        if (i < rows.length) {
            pq_main_loop(r, i, arr, rows);
        }
        else {
            r.resolve(arr);
        }
    });
};

var pq_questionnaires = {
    get:function() {
        var r = q.defer();
        connection.query('SELECT q.ser_num AS q_ser_num, (SELECT qs.string FROM questionnaire_strings qs WHERE q.title_key = qs.string_key AND qs.language = ?) AS title, (SELECT qs.string FROM questionnaire_strings qs WHERE q.nickname_key = qs.string_key AND qs.language = ?) AS nickname, (SELECT qs.string FROM questionnaire_strings qs WHERE q.instructions_key = qs.string_key AND qs.language = ?) AS instructions, q.version, qp.ser_num AS qp_ser_num, qp.patient_ser_num, qp.status, qp.created, qp.last_updated FROM questionnaire_entity_patient_rel qp JOIN questionnaire_entity q ON qp.questionnaire_ser_num = q.ser_num WHERE qp.patient_ser_num = ?;', [lang, lang, lang, patient_ser_num], function(err, rows, fields) {
            if (!err) {
                var qs = [];
                var i = 0;
                pq_main_loop(r, i, qs, rows);
            }
            else {
                r.reject(err);
            }
        });
        return r.promise;
    }
};

app.post('/questionnaires/', function (req,res) {
    if ( typeof req.body.patient_ser_num !== 'undefined' && typeof req.body.language !== 'undefined') {
        patient_ser_num = req.body.patient_ser_num;
        lang = req.body.language;
        var response = [];
        pq_questionnaires.get().then(function(answer) {
            response.push({'result' : 'success', 'data' : answer});
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
        });
    }
    else {
        res.status(400).send("patient_ser_num and language are required parameters");
    }
});

// Create server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
});