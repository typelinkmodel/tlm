# Sample HR Model
This model is for namespace [hr](https://type.link.model.tools/ns/tlm-sample-hr/).

The Sample HR Model is a simple example of using TLM for a concrete domain many people are familiar with. While it
follows best practices, it is kept deliberately very simple. A real-life HR domain would have more types and links in
it.

## Statements about People
A Person is a being regarded as an individual.

* A Person is identified by id which must be a URI.
* A Person has exactly one name which must be a Name.
* A Person has toggle coaches.
* A Person, the coachee, can have some coach which must be a Person, the coach.
  * Examples:

    coachee/name    | coach/name    
    --------------- | --------------
    Leo Simons      | Simon Lucy    
    Leo Simons      | Dirk van Gulik
    Michael Jackson | Diana Ross    

The plural of Person is People.

## Statements about Departments
A Department is a division of an organization.

* A Department is identified by id which must be a URI.
* A Department has exactly one name which must be a Name.
* A Department has exactly one manager which must be a Person.
  * Examples:
  
    department/name | manager/name
    --------------- | --------------
    Engineering     | Dirk van Gulik
    ~~Engineering~~ | ~~Simon Lucy~~

* A Person has at most one department which must be a Department.
  * Examples:
  
    name            | department/name
    --------------- | ---------------
    Dirk van Gulik  | Engineering
    Leo Simons      | Engineering
    Simon Lucy      | Engineering
    ~~Leo Simons~~  | ~~HR~~

The plural of Department is Departments.

## Statements about Teams
A Team is a group of several people associated together.

* A Team is identified by id which must be a URI.
* A Team has at most one name which must be a Name.
* A Team has at least one lead which must be a Person.
* A Person can have some team which must be a Team.

The plural of Team is Teams.
