# The TLM Data Format, TLMD

TLM models, messages and data can be represented in many common formats, including JSON, YAML, and XML. TLM Models can be represented as XML Schema.

The TLM Data format is a custom textual format for specifying TLM models as well as data and messages conforming to TLM models. The standard file extension for such files is `.tlmd` and such files are often referred to as TLMD files.

The TLM Data format does not need to be used in order to use TLM. In particular, for interoperability, use of common formats such as JSON or XML is recommended for software producing and consuming TLM data or messages.

TLMD files are written and processed line by line, with lines split on unix newlines (`\n`). Other common newline styles (windows `\r\n` or the old mac `\r`) are also accepted.

TLMD files must be encoded in UTF-8 and should not start with with the unicode BOM.

# The start line
The first line of a TLMD file is the start line. It starts with the string `# TLM` followed by one or more whitespace characters, followed by the TLM file type (`Model`, `Data`, or `Message`), optionally followed by any number of whitespace characters, optionally followed by a colon `:`, optionally followed by a file title. Any beginning or ending whitespace characters are trimmed off of the file title.

For example:

```tlmd
# TLM Model: HR Example
```

# Section start lines
TLMD files can be divided into sections. A new section is started with a line that starts with three dashes `--- `, followed by one or more whitespace characters, followed by a section title. Any beginning or ending whitespace characters are trimmed off of the file title.

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
TLM lines that start with `//` are comments. There are no multi-line comments. Everything after the initial `//` and until the end of the line is part of the comment. Any beginning or ending whitespace characters are trimmed off of the comment.

```
# TLM Model: HR Example
//           This is a comment
//           ^^ this is where the above comment starts
///          This is another comment
//^^ the third / above is part of the comment, so this form is discouraged
```

# Namespace references
TLM lines that start with `Namespace` are namespace references. After the keyword Namespace follows one or more whitespace characters, followed by the namespace `prefix`, followed by a colon `:`, followed by one or more whitespace characters, followed by the namespace `uri`.

Namespace references must occur in the main section and should occur as the first line in that section.

```
# TLM Data
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/
```

The predefined namespaces (`tlm`, `xs`, `message`) should not be referenced.

The first namespace reference in a file defines the default namespace.

A TLMD Model file must have at least one namespace reference.

# Empty lines
TLM lines that consist of zero or more whitespace characters are empty lines that are ignored. They should consist of zero whitespace characters.



Any lines that are not start lines, comments, namespace references or empty lines are interpreted differently based on the TLMD file type.



# Model files

Here's a partial example of a typical model file:
```tlmd
# TLM Model: HR Example
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/

// The Example HR Model is a simple example of using TLM for a concrete domain many people are familiar with.

--- Person
A Person is a being regarded as an individual.

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
A line in a model file that starts with a letter `[A-Za-z]` and ends with a period `.` is a statement. There are different allowed forms of statements defined by regular expressions; these regular expressions are case-insensitive. Any line that starts with a capital letter and ends with a period that does not form a valid statement is an illegal statement.

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

TODO: implement toggle support in tlm-core-model!

For example:
```tlmd
A Person has toggle coaches.
```

### Plural definition statement
Any statement matching the regular expression
```jsregexp
The\s+plural\s+of\s+([A-Za-z0-9_-]+)\s+is\s+([A-Za-z0-9_-]+)\s*\.
```
is a plural definition statement.

TODO: implement plural support in tlm-core-model!

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
An?\s+([A-Za-z0-9_-]+)\s+is\s+a\s+(.+)\s*\.
```
is a type description statement.

## Examples
Examples are a sequence of multiple lines that follow a statement.

They look like this:
```tlmd
  Examples:
    coachee/name    | coach/name
    ================================
    Leo Simons      | Simon Lucy
    Leo Simons      | Dirk van Gulik
    Michael Jackson | Diana Ross
```

### Examples announcement
A line in a model file that starts with one or more whitespace characters and otherwise consists of the string `Examples:` is an examples announcement that starts a block of examples. It must follow a statement or it is illegal. It must be followed by an examples header.

### Examples header
A line in a model file that starts with one or more whitespace characters and follows an examples line is an examples header.

It optionally starts with the keyword `ok` followed by a vertical bar `|`. After that follows one or more whitespace characters, the `link path` for the from side of the examples, one or more whitespace characters, another vertical bar `|`, one or more whitespace characters, and finally the `link path` for the to side of the examples.

It must be follows by an examples divider line.

### Examples divider
A line in a model file that starts with one or more whitespace characters and then is a series of one or more equals characters `=` is an examples divider. It must be followed by one or more example lines.

### Example
A line in a model file that starts with one or more whitespace characters that follows an examples divider is an example line. If the examples header for these examples started with the keyword `ok`, the example line starts with the keyword `no` if the example is invalid, and is then followed by a vertical bar `|`, followed by one or more whitespace cahracters followed by an `example value` for the from side link path, followed by one or more whitespace characters, followed by a vertical bar `|`, followed by one or more whitespace characters, and finally the `example value` for the to side link path.

Example values consist of 0 or more characters except for newlines or the vertical bar character `|`. Instead of a newline character or vertical bar character, it is recommended comments are added for statements that have these as valid values. For example:

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

## EBNF for Model files

```EBNF
<model-file>       ::= <model-start-line>, NL, { <model-lines> }

<model-start-line> ::= "# TLM", NBWS, <file-type-model>, [ NBWS*, ":", NBWS*, <file-title>, NBWS* ] ;
<file-type-model>  ::= "Model" ;
<file-title>       ::= TEXT ;

<model-lines>      ::= { <model-line> } ;
<model-line>       ::= <section-line>, NL
                       | <namespace-line>, NL
                       | <comment-line>, NL
                       | <empty-line>, NL
                       | <statement> ;

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
<statement-line>   ::= LETTER, TEXT, "." ;
<examples-announcement> ::= NBWS, "Examples:", NL ;
<examples-header>  ::= NBWS, CHAR, TEXT, NL ;
<examples-divider> ::= NBWS, "=", { "=" }, NL ;
<examples-lines>   ::= <examples-line>, NL, { <examples-line>, NL } ;
<examples-line>    ::= NBWS, CHAR, TEXT, NL ;

NL                 ::= "\n" | "\r", "\n" | "\r" ;
NBWS               ::= WS_CHAR, { WS_CHAR } ;
NBWS*              ::= "" | NBWS ;
WS_CHAR            ::= ? any unicode non-breaking whitespace ? ;
TEXT               ::= "" | CHAR, TEXT ;
CHAR               ::= ? any unicode non-breaking printable character ? ;
LETTER             ::= ? any unicode letter ? ;
```

# Data files

Example:
```tlmd
# TLM Data
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

# Message files
Example:
```tlmd
# TLM Message
Namespace hr: https://type.link.model.tools/ns/tlm-sample-hr/

The tlm:Message with id          urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e

--- Subject
The hr:Person with id            mailto:leo@example.com
  has coach:                     mailto:simon@example.com

--- Delivery
The delivery for this message:
  has sender:                    mailto:simon@example.com
  has receiver:                  mailto:hr@example.com
  has sendTime:                  2018-06-11 at 20:09:01 UTC
  has receiveTime:               2018-06-11 at 20:09:27 UTC
```
