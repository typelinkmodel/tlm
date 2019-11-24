# Message

* The Message with id `urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e`:
  * has subject:
    * The Person identified by `mailto:leo@example.com` is coachedBy `mailto:simon@example.com`
  * has a delivery:
    * from      `mailto:simon@example.com`
    * to        `mailto:hr@example.com`
    * sent      _2018-06-11 at 20:09:01 UTC_
    * received  _2018-06-11 at 20:09:27 UTC_

## body

* The Person with id `mailto:leo@example.com`:
  * has name _Leo Simons_
  * has department `mailto:engineering@example.com`
  * has teams:
    - `mailto:content-management-eng@example.com`
    - `mailto:transcoding-eng@example.com`
    - `mailto:eng-management@example.com`
* The Person with id `mailto:simon@example.com`:
  * has name _Simon Lucy_
  * is coachedBy `mailto:dirkx@example.com`
  * has department `mailto:engineering@example.com`
  * has teams:
    - `mailto:content-management-eng@example.com`
    - `mailto:transcoding-eng@example.com`
    - `mailto:eng-management@example.com`
  * coaches
* The Person with id `mailto:dirkx@example.com` has name _Dirk van Gulik_
* The Department with id `mailto:engineering@example.com`:
  * has name _Engineering_
  * has manager `mailto:dirkx@example.com`
* The Department with id `mailto:hr@example.com` has name _HR_

## namespaces
- **default**:   https://type.link.model.tools/ns/tlm/
- **xs**:        https://www.w3.org/TR/xmlschema-2/
- **tlm**:       https://type.link.model.tools/ns/tlm/
- **message**:   https://type.link.model.tools/ns/message/
- **hr**:        https://type.link.model.tools/ns/tlm-sample-hr/

## resolvers
- **mailto**:    https://directory.example.com/person/
- **mailto**:    https://directory.example.com/department/
- **mailto**:    https://directory.example.com/team/
