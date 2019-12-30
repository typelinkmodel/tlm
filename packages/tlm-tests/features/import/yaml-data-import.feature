Feature: YAML Data Import
  In order to work with facts
  As a data administrator
  I want to import a YAML file with facts

  Background:
    Given an empty type-link model is set up
    And the namespace hr exists with uri https://type.link.model.tools/ns/tlm-sample-hr/
    And the namespace hr is the active namespace
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

  Scenario: load HR facts from a YAML file
    When these facts are loaded:
      | ../../docs/design/sample-hr-facts.yaml |
    Then the hr:Person with id "mailto:leo@example.com" should exist
    And the hr:Person with id "mailto:leo@example.com" should have name "Leo Simons"
    And the hr:Person with id "mailto:leo@example.com" should have a department with id "mailto:engineering@example.com"
    Then the hr:Department with id "mailto:engineering@example.com" should exist
    And the hr:Department with id "mailto:engineering@example.com" should have name "Engineering"
    And the hr:Department with id "mailto:engineering@example.com" should have a manager with id "mailto:dirkx@example.com"
