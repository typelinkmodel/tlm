# namespace [hr](https://type.link.model.tools/ns/tlm-sample-hr/):

The HR namespace is for defining facts about people, departments, and teams. 

## Facts about people
* A Person is identified by id which must be a URI.
* A Person has exactly one name which must be a string.
* A Person has toggle coaches.
* A Person can have some coach which must be a Person.

## Facts about departments
* A Department is identified by id which must be a URI.
* A Department has exactly one name which must be a string.
* A Department has exactly one manager which must be a Person.
* A Person has at most one department which must be a Department.

## Facts about teams
* A Team is identified by id which must be a URI.
* A Team has at most one name which must be a string.
* A Team has at least one lead which must be a Person.
* A Person can have some team which must be a Team.
