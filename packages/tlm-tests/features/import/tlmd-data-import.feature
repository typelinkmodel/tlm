Feature: TLMD Data Import
  In order to work with data files
  As a data administrator
  I want to import a TLMD Data file

  Background:
    Given an empty type-link model is set up
    And the namespace hr exists with uri https://type.link.model.tools/ns/tlm-sample-hr/
    And the namespace hr is the active namespace
    And this file is loaded:
      | ../../docs/design/sample-hr-model.tlmd |

  Scenario: import an HR Model definition from a TLMD file
    When this file is loaded:
      | ../../docs/design/sample-hr-data.tlmd |
# TODO:
#    Then the hr:Person with id "mailto:leo@example.com" should exist
#    And the hr:Person with id "mailto:leo@example.com" should have name "Leo Simons"
#    And the hr:Person with id "mailto:leo@example.com" should have a department with id "mailto:engineering@example.com"
#    Then the hr:Department with id "mailto:engineering@example.com" should exist
#    And the hr:Department with id "mailto:engineering@example.com" should have name "Engineering"
#    And the hr:Department with id "mailto:engineering@example.com" should have a manager with id "mailto:dirkx@example.com"
