use crate::{TlmNamespace, TLM_CORE_NAMESPACES};

#[derive(Debug,Clone,Default)]
pub struct NamespaceModel {
    pub(crate) namespaces: Vec<TlmNamespace>,
    pub(crate) active_namespace: Option<String>
}

impl NamespaceModel {
    pub fn new() -> NamespaceModel {
        NamespaceModel {
            namespaces: Vec::new(),
            active_namespace: None
        }
    }

    pub fn initialize(&mut self) {
        self.namespaces.extend_from_slice(TLM_CORE_NAMESPACES.as_slice());
    }

    pub fn add_namespace(&mut self, prefix: String, uri: String, description: Option<String>) {
        // todo check for duplicates

        let mut ns = TlmNamespace::new(
            1, // fixme use oid generator
            prefix,
            uri);
        if let Some(description) = description {
            ns = ns.describe(description);
        }
        self.namespaces.push(ns)
    }

    pub(crate) fn set_active_namespace(&mut self, ns: String) {
        // todo check if namespace exists

        self.active_namespace = Some(ns);
    }
}

// tests for NamespaceModel
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_namespace() {
        let mut m = NamespaceModel::new();
        m.add_namespace(String::from("foo"), String::from("https://foo.example.com/"), None);
        assert_eq!(1, m.namespaces.len());
        assert_eq!("foo", m.namespaces[0].prefix);

        m.add_namespace(String::from("bar"), String::from("file:///bar.example.com/"), None);
        assert_eq!(2, m.namespaces.len());
    }

    #[test]
    fn test_initialize() {
        let mut m = NamespaceModel::new();
        m.initialize();
        assert_eq!(TLM_CORE_NAMESPACES.len(), m.namespaces.len());
        assert_eq!("tlm", m.namespaces[0].prefix);
    }

    #[test]
    fn test_set_active_namespace() {
        let mut m = NamespaceModel::new();
        m.add_namespace(String::from("foo"), String::from("https://foo.example.com/"), None);
        m.set_active_namespace(String::from("foo"));
        assert_eq!(Some("foo".to_string()), m.active_namespace);
    }
}
