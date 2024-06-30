pub mod namespace;
pub use namespace::*;

#[derive(Debug,Clone,Default)]
pub struct Modeler {
    pub namespace_model: NamespaceModel,
}

impl Modeler {
    pub fn new() -> Modeler {
        Modeler {
            namespace_model: NamespaceModel::new()
        }
    }

    pub fn initialize(&mut self) {
        // todo load namespaces from config
    }

    pub fn add_namespace(&mut self, prefix: String, uri: String, description: Option<String>) {
        self.namespace_model.add_namespace(prefix, uri, description);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn modeler() {
        let mut m = Modeler::new();
        m.add_namespace(String::from("foo"), String::from("https://foo.example.com/"), None);
        assert_eq!(1, m.namespace_model.namespaces.len());
        assert_eq!("foo", m.namespace_model.namespaces[0].prefix);
    }
}
