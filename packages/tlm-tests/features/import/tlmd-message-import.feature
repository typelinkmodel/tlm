Feature: TLMD Message Import
  In order to work with message files
  As a message administrator
  I want to import a TLMD Message file

  Background:
    Given an empty type-link model is set up
    And the namespace hr exists with uri https://type.link.model.tools/ns/tlm-sample-hr/
    And the namespace hr is the active namespace
    And this file is loaded:
      | ../../docs/design/sample-hr-model.tlmd |

  Scenario: import an HR Model definition from a TLMD file
    When this file is loaded:
      | ../../docs/design/sample-message.tlmd |
