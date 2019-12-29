# namespace [media](https://type.link.model.tools/ns/sample-media/):

The Media namespace is for defining facts about audiovisual material. 

## Facts about albums
An Album is a "collection of songs".

* An Album has at least one title which must be a string.
* An Album has at least one track which must be a Track.

## Facts about songs
A Song is a "musical composition".

* A Song can have some rendition which must be a Track.
* A Song has at least one title which must be a string.

## Facts about tracks
A Track is a "rendering of a song".

* A Track is exactly one track for an Album.
* A Track must be a rendition for a Song.
* A Track has exactly one position which must be a TrackPosition.

## Facts about track positions
* A TrackPosition is a kind of positiveInteger.
