# Data
Namespaces:
* [hr](https://type.link.model.tools/ns/tlm-sample-hr/)

## People
The hr:Person with id mailto:leo@example.com
* has name: Leo Simons
* has department: mailto:engineering@example.com
* has team:
  - mailto:content-management-eng@example.com
  - mailto:transcoding-eng@example.com
  - mailto:eng-management@example.com

The hr:Person with id mailto:simon@example.com
* has name: Simon Lucy
* is coachedBy: mailto:dirk@example.com
* coaches
* has department: mailto:engineering@example.com
* has team:
  - mailto:content-management-eng@example.com
  - mailto:eng-management@example.com

The hr:Person with id mailto:dirk@example.com
* has name: Dirk van Gulik
* coaches
* has department: mailto:engineering@example.com
* has team:
  -mailto:eng-management@example.com

## Departments
The hr:Department with id mailto:engineering@example.com
* has name: Engineering
* has manager: mailto:dirk@example.com

The hr:Department with id mailto:hr@example.com
* has name: HR

## Teams
The hr:Team with id mailto:content-management-eng@example.com
* has name: Content Management Engineering
* has lead:
  - mailto:leo@example.com

The hr:Team with id mailto:transcoding-eng@example.com
* has name: Transcoding Engineering
* has lead:
  - mailto:leo@example.com

The hr:Team with id mailto:eng-management@example.com
* has name: Engineering Management
* has lead:
  - mailto:dirk@example.com
  - mailto:simon@example.com
