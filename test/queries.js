
var test = require('tape'),
  _ = require('underscore'),
  Mingo = require('../mingo');

var obj = {
  firstName: "Francis",
  lastName: "Asante",
  username: "kofrasa",
  title: "Software Engineer",
  degree: "Computer Science",
  jobs: 6,
  date: {
    year: 2013,
    month: 9,
    day: 25
  },
  languages: {
    spoken: ["english", 'french', 'spanish'],
    programming: ["C", "Python", "Scala", "Java", "Javascript", "Bash", "C#"]
  },
  circles: {
    school: ["Kobby", "Henry", "Kanba", "Nana", "Albert", "Yayra", "Linda", "Sophia"],
    work: ["Kobby", "KT", "Evans", "Robert", "Ehi", "Ebo", "KO"],
    family: ["Richard", "Roseline", "Michael", "Rachel"]
  },
  projects: {
    "C": ["word_grid", "student_record", "calendar"],
    "Java": ["Easy Programming Language", "SurveyMobile"],
    "Python": ["Kasade", "Code Jam", "Flaskapp", "FlaskUtils"],
    "Scala": [],
    "Javascript": ["mingo", "Backapp", "BackboneApp", "Google Election Maps"]
  },
  grades: [
    { grade: 92, mean: 88, std: 8 },
    { grade: 78, mean: 90, std: 5 },
    { grade: 88, mean: 85, std: 3 }
  ],
  today: new Date()
};

test('Comparison, Evaluation, and Element Operators', function (t) {
  t.plan(24);
  var queries = [
    [{firstName: "Francis"}, "can check for equality with $eq"],
    [{lastName: /^a.+e/i}, "can check against regex with literal"],
    [{lastName: {$regex: "a.+e", $options: "i"}}, "can check against regex with $regex operator"],
    [{username: {$not: "mufasa"}}, "can apply $not to direct values"],
    [{username: {$not: { $ne: "kofrasa"}}}, "can apply $not to sub queries"],
    [{jobs: {$gt: 1}}, "can compare with $gt"],
    [{jobs: {$gte: 6}}, "can compare with $gte"],
    [{jobs: {$lt: 10}}, "can compare with $lt"],
    [{jobs: {$lte: 6}}, "can compare with $lte"],
    [{middlename: {$exists: false}}, "can check if value does not exists with $exists"],
    [{projects: {$exists: true}}, "can check if value exists with $exists"],
    [{"projects.C.1": "student_record" }, "can compare value inside array at a given index"],
    [{"circles.school": {$in: ["Henry"]}}, "can check that value is in array with $in"],
    [{"circles.family": {$nin: ["Pamela"]}}, "can check that value is not in array with $nin"],
    [{"languages.programming": {$size: 7 }}, "can determine size of nested array with $size"],
    [{"projects.Python": "Flaskapp"}, "can match nested elements in array"],
    [{"date.month": {$mod: [8, 1]}}, "can find modulo of values with $mod"],
    [{"languages.spoken": {$all: ["french", "english"]}}, "can check that all values exists in array with $all"],
    [{date: {year: 2013, month: 9, day: 25}}, "can match field with object values"],
    [{"grades.0.grade": 92}, "can match fields for objects in a given position in an array with dot notation"],
    [{"grades.mean": { $gt: 70 }}, "can match fields for all objects within an array with dot notation"],
    [{grades: { $elemMatch: { mean: {$gt: 70} } }}, "can match fields for all objects within an array with $elemMatch"],
    [{today: {$type: 9}}, "can match type of fields with $type"],
    [{$where: "this.jobs === 6 && this.grades.length < 10"}, "can match with $where expression"]
  ];

  _.each(queries, function (q) {
    t.ok(Mingo.compile(q[0]).test(obj), q[1]);
  });
});


test("Logical Operators", function (t) {
  t.plan(12);
  var queries = [
    [{$and: [{firstName: "Francis"},{lastName: /^a.+e/i}]}, "can use conjunction true AND true"],
    [{$and: [{firstName: "Francis"},{lastName: "Amoah"}]}, false, "can use conjunction true AND false"],
    [{$and: [{firstName: "Enoch"},{lastName: "Asante"}]}, false, "can use conjunction false AND true"],
    [{$and: [{firstName: "Enoch"},{age: {$exists: true}}]}, false, "can use conjunction false AND false"],
    // or
    [{$or: [{firstName: "Francis"},{lastName: /^a.+e/i}]}, "can use conjunction true OR true"],
    [{$or: [{firstName: "Francis"},{lastName: "Amoah"}]}, "can use conjunction true OR false"],
    [{$or: [{firstName: "Enoch"},{lastName: "Asante"}]}, "can use conjunction false OR true"],
    [{$or: [{firstName: "Enoch"},{age: {$exists: true}}]}, false, "can use conjunction false OR false"],
    // nor
    [{$nor: [{firstName: "Francis"},{lastName: /^a.+e/i}]}, false, "can use conjunction true NOR true"],
    [{$nor: [{firstName: "Francis"},{lastName: "Amoah"}]}, false, "can use conjunction true NOR false"],
    [{$nor: [{firstName: "Enoch"},{lastName: "Asante"}]}, false, "can use conjunction false NOR true"],
    [{$nor: [{firstName: "Enoch"},{age: {$exists: true}}]}, "can use conjunction false NOR false"]
  ];

  _.each(queries, function (q) {
    if (q.length === 2) {
      t.ok(Mingo.compile(q[0]).test(obj), q[1]);
    } else if (q.length === 3) {
      t.equal(Mingo.compile(q[0]).test(obj), q[1], q[2]);
    }
  });
});


test("Array Operators", function (t) {
  t.plan(1);
  var data = [
    {
      "_id" : "5234ccb7687ea597eabee677",
      "code" : "efg",
      "tags" : [ "school", "book"],
      "qty" : [
        { "size" : "S", "num" : 10, "color" : "blue" },
        { "size" : "M", "num" : 100, "color" : "blue" },
        { "size" : "L", "num" : 100, "color" : "green" }
      ]
    },
    {
      "_id" : "52350353b2eff1353b349de9",
      "code" : "ijk",
      "tags" : [ "electronics", "school" ],
      "qty" : [
        { "size" : "M", "num" : 100, "color" : "green" }
      ]
    }
  ];
  var q = Mingo.compile({
    qty: { $all: [
      { "$elemMatch" : { size: "M", num: { $gt: 50} } },
      { "$elemMatch" : { num : 100, color: "green" } }
    ] }
  });

  var result = true;
  _.each(data, function (obj) {
    result = result && q.test(obj);
  });

  t.ok(result, "can match object using $all with $elemMatch");

});