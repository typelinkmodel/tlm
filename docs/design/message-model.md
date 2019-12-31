# namespace [message](https://type.link.model.tools/ns/message/):

The Message namespace is for defining messages containing facts. 

## Statements about Messages
A Message is a "communication from a sender to receivers of facts".

* A Message is identified by id which must an ID.
* A Message has exactly one subject which must be a Fact.
* A Message can have some body each of which must be a Fact.
* A Message has at least one delivery which must be a Delivery.

The plural of Message is Messages.

## Statements about Deliveries
A Delivery is a "record of a message communication occurring".

* A Delivery is exactly one delivery for a Message.
* A Delivery has exactly one sender which must be an Actor.
* A Delivery has exactly one receiver which must be an Actor.
* A Delivery has exactly one sendTime which must be a xs:dateTime.
* A Delivery has at most one receiveTime which must be a xs:dateTime.
* A Delivery can have some authorization each of which must be a SecurityAssertion.

The plural of Delivery is Deliveries.

## Statements about Actors
An Actor is a "party to a communication".

* An Actor is identified by id which must be a URI.
* An Actor has exactly one name which must a string.

The plural of Actor is Actors.

## Statements about SecurityAssertions
A SecurityAssertion is a "statement about a message its security".

* A SecurityAssertion has exactly one issuer which must be an IdentityProvider.
* A SecurityAssertion has exactly one subject which must be an Actor.
* A securityAssertion can have some statement each of which must be a Fact.

The plural of SecurityAssertion is SecurityAssertions.

## Statements about IdentityProviders
A IdentityProvider is an "entity that issues security assertions".

* An IdentityProvider is identified by id which must be a URI.

The plural of IdentityProvider is IdentityProviders.
