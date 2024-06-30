use crate::TlmNamespace;

#[derive(Debug,Clone,Default)]
pub struct NamespaceModel {
    pub(crate) namespaces: Vec<TlmNamespace>
}

impl NamespaceModel {
    pub fn new() -> NamespaceModel {
        NamespaceModel {
            namespaces: Vec::new()
        }
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
}
