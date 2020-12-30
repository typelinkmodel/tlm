# namespace [media](https://type.link.model.tools/ns/sample-media/):

The Media namespace is for defining facts about audiovisual material.

## Statements about Albums

An Album is a "collection of songs".

- An Album has at least one title which must be a string.
- An Album has at least one track which must be a Track.

The plural of Album is Albums.

## Statements about Songs

A Song is a "musical composition".

- A Song can have some rendition which must be a Track.
- A Song has at least one title which must be a string.

The plural of Song is Songs.

## Statements about Tracks

A Track is a "rendering of a song".

- A Track is exactly one track for an Album.
- A Track must be a rendition for a Song.
- A Track has exactly one position which must be a TrackPosition.

The plural of Track is Tracks.

## Statements about TrackPositions

- A TrackPosition is a kind of positiveInteger.

The plural of TrackPosition is TrackPositions.
