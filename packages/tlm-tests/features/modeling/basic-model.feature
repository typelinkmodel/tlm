Feature: Basic Model
  In order to create a basic type-link model
  As a model designer
  I want to define a basic model

  Background:
    Given an empty type-link model is set up
    And the namespace hr exists with uri https://type.link.model.tools/ns/tlm-sample-hr/
    And the namespace hr is the active namespace

  Scenario Outline: define basic types in the HR domain
    When the modeling statement <statement> is added to the model
    Then the model should contain the type <type>
    And the model should contain the link <link> from type <type>
    And the link <link> from type <type> should be constrained to values of type <valueType>
    And the link <link> from type <type> should be singular
    And the link <link> from type <type> should be mandatory
    Examples:
      | statement | type | link | valueType |
      | A Person has exactly one name which must be a string. | Person | name | string |
      | A Department has exactly one name which must be a string. | Department | name | string |

  Scenario Outline: define identity types for basic types in the HR domain
    When the modeling statement <statement> is added to the model
    Then the model should contain the type <type>
    And the model should contain the link <link> from type <type>
    And the link <link> from type <type> should be constrained to values of type <valueType>
    And the link <link> from type <type> should be a primary id
    Examples:
      | statement | type | link | valueType |
      | A Person is identified by id which must be a URI. | Person | id | URI |
      | A Department is identified by id which must be a URI. | Department | id | URI |

  Scenario: define a full HR domain
    Given this model:
      | A Person has exactly one name which must be a string.        |
      | A Person is identified by id which must be a URI.            |
      | A Person has at least one coach which must be a Person.      |
      | A Department has exactly one name which must be a string.    |
      | A Department is identified by id which must be a URI.        |
      | A Department has exactly one manager which must be a Person. |
      | A Team has at most one name which must be a string.          |
      | A Team is identified by id which must be a URI.              |
      | A Person can have some team each of which must be a Team.   |
      | A Team has at least one lead which must be a Person.         |
    Then the link name from type Team should be singular
    Then the link name from type Team should be optional
    Then the link team from type Person should be constrained to values of type Team
    Then the link team from type Person should be plural
    Then the link team from type Person should be optional
    Then the link lead from type Team should be constrained to values of type Person
    Then the link lead from type Team should be plural
    Then the link lead from type Team should be mandatory
