Feature: TLMD Model Import
  In order to work with model files
  As a model administrator
  I want to import a TLMD Model file

  Background:
    Given an empty type-link model is set up
    And the namespace hr exists with uri https://type.link.model.tools/ns/tlm-sample-hr/
    And the namespace hr is the active namespace

  Scenario: import an HR Model definition from a TLMD file
    When this file is loaded:
      | ../../docs/design/sample-hr-model.tlmd |
    Then the model should contain the type Person
#    Then the model should contain the type Department
#    Then the model should contain the type Team
#    Then the link name from type Team should be singular
#    Then the link name from type Team should be optional
#    Then the link team from type Person should be constrained to values of type Team
#    Then the link team from type Person should be plural
#    Then the link team from type Person should be optional
#    Then the link lead from type Team should be constrained to values of type Person
#    Then the link lead from type Team should be plural
#    Then the link lead from type Team should be mandatory
