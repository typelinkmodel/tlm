Feature: Basic Model
  In order to create a basic type-link model
  As a model designer
  I want to define a basic model

  Background:
    Given an empty type-link model is set up
    And the namespace req exists with uri https://type.link.model.tools/ns/sample-requirements/
    And the namespace req is the active namespace

  Scenario: define a requirements domain
    Given this model:
      | A Requirement is identified by id which must be a RequirementNumber. |
      | A RequirementNumber is a kind of Name.                               |
      | A Requirement has exactly one description which must be a string.    |
    Then the link id from type Requirement should be constrained to values of type RequirementNumber
    Then the type req:RequirementNumber should have the supertype xs:Name
