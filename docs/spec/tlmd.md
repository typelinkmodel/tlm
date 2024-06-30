# The TLM Data Format, TLMD

TLM models, messages and data can be represented in many common formats, including JSON, YAML, and XML. TLM Models can
be represented as XML Schema.

The TLM Data format is a custom textual format for specifying TLM models as well as data and messages conforming to TLM
models. The standard file extension for such files is `.tlmd` and such files are often referred to as TLMD files.

The TLM Data format is most useful for models. While it is general purpose enough for various other use, the TLM Data
format does not need to be used in order to use TLM. In particular, for interoperability, use of common formats such as
JSON or XML is recommended for software producing and consuming general-purpose TLM data or messages. (Especially see
the various warnings about empty value and whitespace handling below.)

TLMD files are written and processed line by line, with lines split on unix newlines (`\n`). Other common newline
styles (windows `\r\n` or the old mac `\r`) are also accepted.

TLMD files must be encoded in UTF-8 and should not start with the unicode BOM.

# The start line

The first line of a TLMD file is the start line. It starts with the string `# TLM` followed by one or more whitespace
characters, followed by the TLM file type (`Model`, `Data`, or `Message`), optionally followed by any number of
whitespace characters, optionally followed by a colon `:`, optionally followed by a file title. Any beginning or ending
whitespace characters are trimmed off of the file title.

For example:

```tlmd
# TLM Model: HR Example
```

# Section start lines

TLMD files can be divided into sections. A new section is started with a line that starts with three dashes `--- `,
followed by one or more whitespace characters, followed by a section title. Any beginning or ending whitespace
characters are trimmed off of the file title.

For example:

```tlmd
# TLM Model: HR Example
--- People
// statements about people go here
```

Lines that come after section start lines are in that section.

Any lines that occur after the start line but before the first section line are in the special `main` section:

```tlmd
# TLM Model: HR Example
// this comment is in the "main" section
--- People
// this comment is in the "People" section
```

It is not allowed to define another section called main:

```
# TLM Model: HR Example
--- People
// this comment is in the "People" section
--- main
// the above line is illegal
// this comment is in the "People" section
```

There is no semantic meaning attached to sections in TLM.

# Comments

TLM lines that start with `//` are comments. There are no multi-line comments. Everything after the initial `//` and
until the end of the line is part of the comment. Any beginning or ending whitespace characters are trimmed off of the
comment.

```
# TLM Model: HR Example
//           This is a comment
//           ^^ this is where the above comment starts
///          This is another comment
//^^ the third / above is part of the comment, so this form is discouraged
```

# Namespace references

TLM lines that start with `Namespace` are namespace references. After the keyword Namespace follows one or more
whitespace characters, followed by the namespace `prefix`, followed by a colon `:`, followed by one or more whitespace
characters, followed by the namespace `uri`.

Namespace references must occur in the main section and should occur as the first lines in that section.

```
# TLM Data
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/
```

The predefined namespaces (`tlm`, `xs`, `message`) should not be referenced.

The first namespace reference in a file defines the default namespace.

A TLMD Model file must have at least one namespace reference. Its contained model should be for that namespace.

# Empty lines

TLM lines that consist of zero or more whitespace characters are empty lines that are ignored. They should consist of
zero whitespace characters.

Any lines that are not start lines, comments, namespace references or empty lines may be interpreted differently based
on the TLMD file type.

# Model files

A TLMD Model file defines TLM types and links within a namespace. It has a similar purpose to a DDL (Data Definition
Language) file in SQL, to an XML Schema file or to a UML XMI file.

Here's a partial example of a typical model file:

```tlmd
# TLM Model: HR Example
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/

// The Example HR Model is a simple example of using TLM for a concrete domain many people are familiar with.

--- Person
A Person is a "being regarded as an individual".

A Person is identified by id which must be a URI.
A Person has exactly one name which must be a Name.
A Person, the coachee, can have some coach which must be a Person, the coach.
  Examples:
    coachee/name    | coach/name
    ================================
    Leo Simons      | Simon Lucy
    Leo Simons      | Dirk van Gulik
    Michael Jackson | Diana Ross
```

## Statements

A line in a TLMD file that starts with the word 'A' or 'An' and ends with a period `.` is a statement. There are
different allowed forms of statements defined by regular expressions; these regular expressions are case-insensitive.
Any line that starts with 'A' or 'An' and ends with a period that does not form a valid statement is an illegal
statement.

### Link definition statements

Any statement matching the regular expression

```jsregexp
An?\s+([A-Za-z0-9_-]+)\s+(is\s+identified\s+by|has\s+exactly\s+one|has\s+at\s+most\s+one|has\s+at\s+least\s+one|can\s+have\s+some)\s+([A-Za-z0-9_-]+)\s+(?:each\s+of\s+)?which\s+must\s+be\s+an?\s+([A-Za-z0-9_-]+)\s*\.
```

is a link definition statement.

Some examples:

```tlmd
A Person is identified by id which must be a URI.
A Person has exactly one name which must be a Name.
```

### Reverse link definition statement

Any statement matching the regular expression

```jsregexp
An?\s+([A-Za-z0-9_-]+)\s+(is\s+exactly\s+one|must\s+be\s+a)\s+([A-Za-z0-9_-]+)\s+for\s+an?\s+([A-Za-z0-9_-]+)\s*\.
```

is a reverse link definition statement.

For example:

```tlmd
A Track must be a rendition for a Song.
```

### Toggle link definition statement

Any statement matching the regular expression

```jsregexp
An?\s+([A-Za-z0-9_-]+)\s+has\s+toggle\s+([A-Za-z0-9_-]+)\s*\.
```

is a toggle link definition statement.

For example:

```tlmd
A Person has toggle coaches.
```

### Plural definition statement

Any statement matching the regular expression

```jsregexp
A\s+plural\s+of\s+([A-Za-z0-9_-]+)\s+is\s+([A-Za-z0-9_-]+)\s*\.
```

is a plural definition statement.

For example:

```tlmd
The plural of Person is People.
```

### Super type definition statement

Any statement matching the regular expression

```jsregexp
An?\s+([A-Za-z0-9_-]+)\s+is\s+a\s+kind\s+of\s+([A-Za-z0-9_-]+)\s*\.
```

is a super type definition statement.

### Type description statement

Any statement matching the regular expression

```jsregexp
An?\s+([a-z0-9_-]+)\s+is\s+a\s+(?:"([^"]+)"|([^.])+)\s*\.
```

is a type description statement.

## Examples

Examples are a sequence of multiple lines that follow a statement.

They look like this:

```tlmd
A Person, the coachee, can have some coach which must be a Person, the coach.
  Examples:
    coachee/name    | coach/name
    ================================
    Leo Simons      | Simon Lucy
    Leo Simons      | Dirk van Gulik
    Michael Jackson | Diana Ross
```

There cannot be comments embedded in an example. This is illegal:

```tlmd
  Examples:
    coachee/name    | coach/name
    ================================
    Leo Simons      | Simon Lucy
// a comment in the middle of the example is illegal
    Leo Simons      | Dirk van Gulik
```

There cannot be empty lines embedded in an example. This is illegal:

```tlmd
  Examples:
    coachee/name    | coach/name
    ================================
    Leo Simons      | Simon Lucy

    Leo Simons      | Dirk van Gulik
```

### Examples announcement

A line in a model file that starts with one or more whitespace characters and otherwise consists of the
string `Examples:` is an examples announcement that starts a block of examples. It must follow a statement or it is
illegal. It must be followed by an examples header.

### Examples header

A line in a model file that starts with one or more whitespace characters and follows an examples line is an examples
header.

It optionally starts with the keyword `ok`, followed by 0 or more whitespace characters, followed by a vertical bar `|`.
After that follows 0 or more whitespace characters, the `link path` for the from side of the examples, 0 or more
whitespace characters, another vertical bar `|`, 0 or more whitespace characters, and finally the `link path` for the to
side of the examples.

It must be followed by an examples divider line or an example line.

### Examples divider

A line in a model file that starts with one or more whitespace characters and then is a series of one or more equals
characters `=` is an examples divider. It must be followed by one or more example lines.

The divider should be a line of equals characters, but any combination of equals `=`, dash `-` and vertical bar `|` is
also allowed.

### Example

A line in a model file that starts with one or more whitespace characters that follows an examples divider is an example
line. If the examples header for these examples started with the keyword `ok`, the example line starts with the
keyword `no` if the example is invalid, and is then followed by 0 or more whitespace characters and a vertical bar `|`,
followed by 0 or more whitespace characters followed by an `example value` for the from side link path, followed by 0 or
more whitespace characters, followed by a vertical bar `|`, followed by 0 or more whitespace characters, and finally
the `example value` for the to side link path.

Example values consist of 0 or more characters except for newlines or the vertical bar character `|`. Instead of a
newline character or vertical bar character, it is recommended comments are added for statements that have these as
valid values. For example:

```tlmd
A ValidationRegularExpression has exactly one name which must be a Name.
A ValidationRegularExpression has one serialization which must be a string.
  Examples:
    name                 | serialization
    ====================================
    ascii-letters        | [A-za-z]
    ascii-special-char   | !@#$%^&*()[]{}:";'\<>?,./
// The ascii-special-char serialization also includes the vertical bar character `|`
```

## Data in model files

Model files can also contain all lines that are contained in data files.

It is assumed that the contained data is static reference/schema data that belongs with the model definition, but there
is no way for implementations to verify this. Implementations may put limits on the number of data lines allowed in
model files.

# Data files

A TLMD data file defines objects and facts.

Example:

```tlmd
# TLM Data: Example HR Data
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/

--- People
The hr:Person with id            mailto:leo@example.com
  has name:                      Leo Simons
  has department:                mailto:engineering@example.com
  has team:
    mailto:content-management-eng@example.com
    mailto:transcoding-eng@example.com
    mailto:eng-management@example.com
```

## Data

A line in a TLMD file that starts with the word 'The' is an Object line. After an object line there can be a further
sequence of multiple lines that define facts about that object. The object line combined with the following fact lines
is a data sequence. Object lines and fact lines must follow specific regular expression patterns. A line that starts
with 'The' but that is not a valid object line is an illegal line.

Like with examples in model files, there cannot be comments or empty lines in the data sequence.

### Object line

The object line must match the regular expression

```jsregexp
The\s+([A-Z0-9_:-]+)\s+with\s+id\s+([^\t]+)\s*
```

the type name must always be qualified with the namespace prefix.

Example:

```tlmd
The hr:Person with id            mailto:leo@example.com
```

### Fact line

Any fact line matching the regular expression

```jsregexp
\s+has\s+([a-z0-9_-]+)\s*:\s*([^\s].*)
```

defines a regular link fact.

Examples:

```tlmd
The hr:Person with id            mailto:simon@example.com
  has name:                      Leo Simons
  has department:                mailto:engineering@example.com
```

**Warning**: it is not possible to define an empty value with a regular link fact expression.

### Toggle line

Any fact line matching the regular expression

```jsregexp
\s+([a-z0-9_-]+)
```

defines a toggle fact.

Example:

```tlmd
The hr:Person with id            mailto:simon@example.com
  coaches
```

### Multi-fact start line

Any fact line matching the regular expression

```jsregexp
\s+has\s+([a-z0-9_-]+)\s*:\s*
```

defines the start of a sequence of lines providing multiple values for a particular link fact.

Example:

```tlmd
The hr:Person with id            mailto:leo@example.com
  has team:
```

It should be followed by one or more multi-fact value lines.

### Multi-fact value line

Any fact line matching the regular expression

```jsregexp
\s+(.*)
```

that follows after a multi-fact start line or value line defines the value for the link fact.

Example:

```tlmd
The hr:Person with id            mailto:leo@example.com
  has team:
    mailto:content-management-eng@example.com
    mailto:transcoding-eng@example.com
    mailto:eng-management@example.com
```

**Warning**: it is not possible to define empty values with multi-fact value lines.

## String encoding of values

Values in the data file are stored as UTF-8 character sequences that do not contain line breaking characters and do not
start with whitespace.

For non-string values they must be (de)serialized the same way as they would be in a UTF-8 encoded XML document.

Any whitespace at the beginning of a value as well as any line breaking character within a value must be escaped using a
backslash. The algorithm is:

```js
function serialize(value) {
  let result = value;
  if (
    result.match(/^\s/) ||
    result.indexOf("\n") !== -1 ||
    result.indexOf("\r") !== -1
  ) {
    result = result
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r");
    if (result.match(/^\s/)) {
      result = "\\" + result;
    }
  }
  return result;
}
```

Before deserialization all such values must be unescaped. The algorithm is:

```js
function deserialize(value) {
  let result = value;
  if (result.match(/^\\\s/) || result.match(/\\r/) || result.match(/\\n/)) {
    if (result.match(/^\\\s/)) {
      result = result.substring(1);
    }
    result = value
      .replace(/\\r/g, "\r")
      .replace(/\\n/g, "\n")
      .replace(/\\\\/g, "\\");
  }
  return result;
}
```

**Warning**: These algorithms are not fully safe. In particular values that contain a literal sequence of `\ ` or `\n`
or `\r` on serialization will _not_ receive escaping treatment on serialization, but on deserialization they _will_ be
unescaped. This is a similar problem to what happens when working with quote-less CSV files. General-purpose data
formats such as JSON or XML do not suffer from such ambiguity, and are recommended in favor of TLMD whenever this
ambiguity may create a problem.

The choice made here is made for maximum readability of TLMD files in the cases where the ambiguity does not exist. The
choice to not have a way to represent empty values is a similar choice.

## Models in data files

Data files can also contain all lines that are contained in model files.

It is assumed that the contained model definition is a description of the schema used by the data in the same file.
Implementations may ignore model definitions in data files. Implementations may reject data files that have model
statements that they do not accept.

# Message files

A TLMD Message file is a specialization of a TLMD Data file. It should have one Object line for a `message:Message` and
should fully contain all other facts known about the message by the sender. It may also have multiple Object lines for
`message:Delivery` objects belonging to that Message.

The first line in the message that is not about a Message or Delivery is the message `subject`.

Any other facts defined in the message file comprise the message `body`.

## Models in message files

Messages files can also contain all lines that are contained in model files.

It is assumed model statements contained in the message are intended as part of the message and should be interpreted
accordingly by the receiver. This makes it possible to send messages to systems that are intended as instructions to
update their model definitions.

Example:

```tlmd
# TLM Message: example coach change
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/

The hr:Person with id            mailto:leo@example.com
  has coach:                     mailto:simon@example.com

The tlm:Message with id          urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e
  has delivery:                  urn:uuid:486f51f2-5630-11ea-82b4-0242ac130003

The tlm:Delivery with id         urn:uuid:486f51f2-5630-11ea-82b4-0242ac130003
  has sender:                    mailto:simon@example.com
  has receiver:                  mailto:hr@example.com
  has sendTime:                  2018-06-11-20:09:01Z
  has receiveTime:               2018-06-11-20:09:27Z
```

Example of a message containing model definitions:

```tlmd
# TLM Message: people have optional birth dates
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/

A hr:Person has at most one birthDate which must be a xs:date.

The tlm:Message with id          urn:uuid:5da519d4-5636-11ea-8e2d-0242ac130003
  has delivery:                  urn:uuid:616040d0-5636-11ea-8e2d-0242ac130003

The tlm:Delivery with id         urn:uuid:616040d0-5636-11ea-8e2d-0242ac130003
  has sender:                    mailto:leo@example.com
  has receiver:                  wss://type.link.model.tools/ns/tlm-sample-hr/
  has sendTime:                  2020-02-23-12:21:00Z
```

# EBNF for TLMD files

This grammar was hand-written and has not been used with any grammar tools. It probably has bugs.

```EBNF
<tlmd-file>       ::= <start-line>, NL, { <lines> }

<start-line>       ::= "# TLM", NBWS, <file-type>, [ NBWS*, ":", NBWS*, <file-title>, NBWS* ] ;
<file-type-model>  ::= "Model" | "Data" | "Message" ;
<file-title>       ::= TEXT ;

<lines>            ::= { <line> } ;
<line>             ::= <section-line>, NL
                       | <namespace-line>, NL
                       | <comment-line>, NL
                       | <empty-line>, NL
                       | <statement>
                       | <data> ;

<section-line>     ::= "---", NBWS, <section-title> ;
<section-title>    ::= TEXT ;

<namespace-line>   ::= "Namespace", NBWS, <namespace-prefix>, NBWS*, ":", NBWS*, <namespace-uri>
<namespace-prefix> ::= NS_CHAR, { NS_CHAR } ;
<namespace-uri>    ::= ? any URI character ? ;
NS_CHAR            ::= ? any xs:NCName character ? ;

<comment-line>     ::= "//", NBWS*, <comment> ;
<comment>          ::= TEXT ;

<empty-line>       ::= NBWS* ;

<statement>        ::= <statement-line>, NL,
                       [ <examples-announcement>, <examples-header>, <examples-divider>, <examples-lines> ] ;
<statement-line>   ::= "A" | "An", NBWS, TEXT, "." ;
<examples-announcement> ::= NBWS, "Examples:", NL ;
<examples-header>  ::= NBWS, CHAR, TEXT, NL ;
<examples-divider> ::= NBWS, "=", { "=" }, NL ;
<examples-lines>   ::= <examples-line>, NL, { <examples-line>, NL } ;
<examples-line>    ::= NBWS, CHAR, TEXT, NL ;

<data>             ::= <object-line>, NL, { <fact-line> }
<object-line>      ::= "The", NBWS, "with id", NBWS, <id> ;
<id>               ::= NON_TAB, { NON_TAB } ;

<fact-line>        ::= <link-fact> | <toggle-fact> | <multi-fact> ;
<link-fact>        ::= NBWS, "has", NBWS, <link-name>, NBWS* ":", NBWS*, <link-value>, NL ;
<toggle-fact>      ::= NBWS, <link-name>, NBWS*, NL ;
<multi-fact>       ::= NBWS, <link-name>, NBWS*, ":", NL, <multi-fact-values> ;
<link-name>        ::= ? any xs:Name character ? ;
<link-value>       ::= NON_WS, { TEXT } ;
<multi-fact-values> ::= <multi-fact-value>, {multi-fact-value}
<multi-fact-value> ::= NBWS, <link-value>

NL                 ::= "\n" | "\r", "\n" | "\r" ;
NBWS               ::= WS_CHAR, { WS_CHAR } ;
NBWS*              ::= "" | NBWS ;
WS_CHAR            ::= ? any unicode non-breaking whitespace ? ;
NON_WS             ::= ? any unicode non-breaking prinable character except whitesapce ? ;
TEXT               ::= "" | CHAR, TEXT ;
CHAR               ::= ? any unicode non-breaking printable character ? ;
LETTER             ::= ? any unicode letter ? ;
NON_TAB            ::= ? any unicode non-breaking non-tab printable character ? ;
```
