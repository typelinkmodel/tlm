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
