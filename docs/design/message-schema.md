# namespace [message](https://type.link.model.tools/ns/message/):

The Message namespace is for defining messages containing facts. 

## Facts about messages
A Message is a "communication from a sender to receivers of facts".

* A Message is identified by id which must an ID.
* A Message has exactly one subject which must be a Fact.
* A Message can have some body each of which must be a Fact.
* A Message has at least one delivery which must be a Delivery.

## Facts about deliveries
A Delivery is a "record of a message communication occurring".

* A Delivery is exactly one delivery for a Message.
* A Delivery has exactly one sender which must be an Actor.
* A Delivery has exactly one receiver which must be an Actor.
* A Delivery has exactly one sendTime which must be a dateTimeStamp.
* A Delivery has at most one receiveTime which must be a dateTimeStamp.
* A Delivery can have some authorization each of which must be a SecurityAssertion.

## Facts about actors
An Actor is a "party to a communication".

* An Actor has exactly one name which must a string.

## Facts about security assertions
A SecurityAssertion is a "statement about a message its security".

* A SecurityAssertion has exactly one issuer which must be an IdentityProvider.
* A SecurityAssertion has exactly one subject which must be an Actor.
* A securityAssertion can have some statement each of which must be a Fact.

## Facts about identity providers
A IdentityProvider is an "entity that issues security assertions".

* An IdentityProvider is identified by id which must be a URI.
