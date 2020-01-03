# namespace [hr](https://type.link.model.tools/ns/tlm-sample-hr/):

The HR namespace is for defining facts about people, departments, and teams. 

## Statements about People
A Person is a "being regarded as an individual".

* A Person is identified by id which must be a URI.
* A Person has exactly one name which must be a Name.
* A Person has toggle coaches.
* A Person can have some coach which must be a Person.

The plural of Person is People.

## Statements about Departments
A Department is a "division of an organization".

* A Department is identified by id which must be a URI.
* A Department has exactly one name which must be a Name.
* A Department has exactly one manager which must be a Person.
* A Person has at most one department which must be a Department.

The plural of Department is Departments.

## Statements about Teams
A Team is a "group of several people associated together".

* A Team is identified by id which must be a URI.
* A Team has at most one name which must be a Name.
* A Team has at least one lead which must be a Person.
* A Person can have some team which must be a Team.

The plural of Team is Teams.
