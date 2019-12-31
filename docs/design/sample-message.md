# Message

* The Message with id `urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e`:
  * has subject:
    * The hr:Person identified by `mailto:leo@example.com` is coachedBy `mailto:simon@example.com`
  * has a delivery:
    * sender        `mailto:simon@example.com`
    * receiver      `mailto:hr@example.com`
    * sendTime      _2018-06-11 at 20:09:01 UTC_
    * receiveTime   _2018-06-11 at 20:09:27 UTC_

## body

* The hr:Person with id `mailto:leo@example.com`:
  * has name _Leo Simons_
  * has department `mailto:engineering@example.com`
  * has team:
    - `mailto:content-management-eng@example.com`
    - `mailto:transcoding-eng@example.com`
    - `mailto:eng-management@example.com`
* The hr:Person with id `mailto:simon@example.com`:
  * has name _Simon Lucy_
  * is coachedBy `mailto:dirk@example.com`
  * has department `mailto:engineering@example.com`
  * has team:
    - `mailto:content-management-eng@example.com`
    - `mailto:transcoding-eng@example.com`
    - `mailto:eng-management@example.com`
* The hr:Person with id `mailto:dirk@example.com` has name _Dirk van Gulik_
* The hr:Department with id `mailto:engineering@example.com`:
  * has name _Engineering_
  * has manager `mailto:dirk@example.com`
* The hr:Department with id `mailto:hr@example.com` has name _HR_

## namespaces
- **default**:   https://type.link.model.tools/ns/tlm/
- **xs**:        https://www.w3.org/TR/xmlschema-2/
- **tlm**:       https://type.link.model.tools/ns/tlm/
- **message**:   https://type.link.model.tools/ns/message/
- **hr**:        https://type.link.model.tools/ns/tlm-sample-hr/
