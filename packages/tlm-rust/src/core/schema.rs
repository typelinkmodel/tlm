
pub type TlmOid = i32; // psql serial goes from 1 to 2147483647

pub const TLM_TYPE_NAMESPACE: TlmOid = 3;
// const TLM_TYPE_TYPE: TlmOid = 4;
// const TLM_TYPE_LINK: TlmOid = 53;

pub trait TlmObject : Clone + Eq + Default {
    fn oid(&self) -> TlmOid;
    fn tlm_type(&self) -> TlmOid;
}

#[derive(Debug,Clone,Hash,PartialEq,Eq,Default)]
pub struct TlmNamespace {
    pub oid: TlmOid,
    pub prefix: String,
    pub uri: String,
    pub description: Option<String>
}

impl TlmObject for TlmNamespace {
    fn oid(&self) -> TlmOid {
        self.oid
    }

    fn tlm_type(&self) -> TlmOid {
        TLM_TYPE_NAMESPACE
    }
}

impl TlmNamespace {
    pub fn new(oid: TlmOid, prefix: String, uri: String) -> TlmNamespace {
        TlmNamespace {
            oid,
            prefix,
            uri,
            ..TlmNamespace::default()
        }
    }

    pub fn describe(self, description: String) -> TlmNamespace {
        TlmNamespace {
            description: Some(description),
            ..self
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tlm_namespace() {
        let ns = TlmNamespace::default();
        assert_eq!(0, ns.oid());
        assert_eq!(TLM_TYPE_NAMESPACE, ns.tlm_type());
        assert_eq!(String::from(""), ns.prefix);
        assert_eq!(String::from(""), ns.uri);

        let ns = TlmNamespace::new(
            1,
            String::from("foo"),
            String::from("https://foo.example.com/"));
        assert_eq!(1, ns.oid());
        assert_eq!(TLM_TYPE_NAMESPACE, ns.tlm_type());
        assert_eq!("foo", ns.prefix);
        assert_eq!("https://foo.example.com/", ns.uri);
        assert_eq!(None, ns.description);

        let ns = ns.describe(String::from("A namespace"));
        assert_eq!(1, ns.oid());
        assert_eq!(TLM_TYPE_NAMESPACE, ns.tlm_type());
        assert_eq!("A namespace", ns.description.as_ref().unwrap());

        let ns2 = ns.clone();
        assert_eq!(ns.oid, ns2.oid);
        assert_eq!(ns.prefix, ns2.prefix);
        assert_eq!(ns.uri, ns2.uri);
        assert_eq!(ns.description.as_ref(), ns2.description.as_ref());
    }
}
