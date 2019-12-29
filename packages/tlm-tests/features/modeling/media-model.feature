Feature: Basic Model
  In order to create a basic type-link model
  As a model designer
  I want to define a model with descriptions and bi-directional link constraints.

  Background:
    Given an empty type-link model is set up
    And the namespace media exists with uri https://type.link.model.tools/ns/sample-media/
    And the namespace media is the active namespace

  Scenario: define a media domain
    Given this model:
      | An Album is a "collection of songs".                            |
      | An Album has at least one title which must be a string.         |
      | An Album has at least one track which must be a Track.          |
      | A Song is a "musical composition".                              |
      | A Song can have some rendition which must be a Track.           |
      | A Song can have some rendition which must be a Track.           |
      | A Song has at least one title which must be a string.           |
      | A Track is a "rendering of a song".                             |
      | A Track is exactly one track for an Album.                      |
      | A Track must be a rendition for a Song.                         |
      | A Track has exactly one position which must be a TrackPosition. |
      | A TrackPosition is a kind of positiveInteger.                   |
    Then the description of type Album should be collection of songs
    And the link title from type Album should be mandatory
    And the link title from type Album should be optional for the target type
    And the description of type Track should be rendering of a song
    And the link track from type Album should be plural
    And the link track from type Album should be mandatory
    And the link track from type Album should be singular for the target type
    And the link track from type Album should be mandatory for the target type
    And the link rendition from type Song should be plural for the target type
    And the link rendition from type Song should be mandatory for the target type
